import * as React from 'react';
import { Tabs, Row, Col, Layout, Button, Modal, message } from 'antd';
import { Prompt } from 'react-router-dom';

import { OverviewTab } from './Overview';
import { PredictorsTab } from './Predictors';
import { Home } from './Home';
import {
  Store, Analysis, Dataset, Task, Run, Predictor,
  ApiDataset, ApiAnalysis
} from './commontypes';
import { displayError, jwtFetch, Space } from './utils';

const { TabPane } = Tabs;
const { Footer, Content } = Layout;

// const logo = require('./logo.svg');
const domainRoot = 'http://localhost:80';
const EMAIL = 'test2@test.com';
const PASSWORD = 'password';

// Create initialized app state (used in the constructor of the top-level App component)
const initializeStore = (): Store => ({
  activeTab: 'overview',
  predictorsActive: false,
  transformationsActive: false,
  contrastsActive: false,
  modelingActive: false,
  reviewActive: true,
  analysis: {
    analysisId: undefined,
    name: 'Untitled',
    description: '',
    datasetId: null,
    predictions: '',
    runIds: [],
    predictorIds: [],
    locked: false,
    private: true
  },
  datasets: [],
  availableTasks: [],
  availableRuns: [],
  selectedTaskId: null,
  availablePredictors: [],
  selectedPredictors: [],
  unsavedChanges: false
});

const getJwt = () => new Promise((resolve, reject) => {
  /* Returns an access token (JWT) as a promise, either straight from local 
     storage or by fetching from the server (/auth) with username/password and 
     caching it to local storage. */
  const jwt = window.localStorage.getItem('jwt');
  if (jwt) {
    resolve(jwt);
  } else {
    fetch(domainRoot + '/api/auth', {
      method: 'post',
      body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
      headers: {
        'Content-type': 'application/json'
      }
    })
      .then((response) => {
        response.json().then((data: { access_token: string }) => {
          if (data.access_token) {
            message.success('Authentication successful');
            window.localStorage.setItem('jwt', data.access_token);
            resolve(data.access_token);
          }
        });
      })
      .catch(displayError);
  }
});

// Wrapper around 'fetch' to add JWT authorization header and authenticate first if necessary  
const authorizeAndFetch = (path: string, options?: object) => {
  return getJwt().then((jwt: string) => {
    const newOptions = {
      ...options,
      headers: {
        'Content-type': 'application/json',
        'Authorization': 'JWT ' + jwt
      }
    };
    return fetch(path, newOptions);
  });
};

// Normalize dataset object returned by /api/datasets
const normalizeDataset = (d: ApiDataset): Dataset => {
  const authors = d.description.Authors ? d.description.Authors.join(', ') : 'No authors listed';
  const description = d.description.Description;
  const url = d.description.URL;
  const id = d.id.toString();
  const { name } = d;
  return { id, name, authors, url, description };
};

// Get array of unique tasks from a list of runs, and count the number of runs associated with each
const getTasks = (runs: Run[]): Task[] => {
  let taskMap: Map<string, Task> = new Map();
  for (let run of runs) {
    const key = run.task.id;
    if (taskMap.has(key)) {
      taskMap.get(key)!.numRuns += 1;
    } else {
      taskMap.set(key, { ...run.task, numRuns: 1 });
    }
  }
  return Array.from(taskMap.values());
}

type BuilderProps = { id?: string }
export class AnalysisBuilder extends React.Component<BuilderProps, Store> {
  constructor(props: BuilderProps) {
    super(props);
    this.state = initializeStore();
    // Load analysis from server if an analysis id is specified in the props
    if (!!props.id) {
      jwtFetch(`${domainRoot}/api/analyses/${props.id}`)
        .then(response => response.json() as Promise<ApiAnalysis>)
        .then(data => this.loadAnalysis(data))
        .catch(displayError);
    }
    jwtFetch(domainRoot + '/api/datasets')
      .then(response => response.json())
      .then(data => {
        const datasets: Dataset[] = data.map(d => normalizeDataset(d));
        this.setState({ 'datasets': datasets });
      })
      .catch(displayError);
  }

  saveEnabled = (): boolean => this.state.unsavedChanges && !this.state.analysis.locked;
  submitEnabled = (): boolean => !this.state.analysis.locked;
  cloneEnabled = (): boolean => this.state.analysis.analysisId !== null && this.state.analysis.locked;

  // Save analysis to server, either with lock=false (just save), or lock=true (save & submit)
  saveAnalysis = ({ locked = false }) => (): void => {
    const analysis = this.state.analysis;
    if (analysis.datasetId === null) {
      displayError(Error('Analysis cannot be saved without selecting a dataset'));
      return;
    }
    const apiAnalysis: ApiAnalysis = {
      name: analysis.name,
      description: analysis.description,
      locked: locked,
      private: analysis.private,
      dataset_id: analysis.datasetId,
      runs: analysis.runIds.map(id => ({ id })),
      predictors: analysis.predictorIds.map(id => ({ id })),
      transformations: {}
    };
    const method = analysis.analysisId ? 'put' : 'post';
    const url = analysis.analysisId ?
      `${domainRoot}/api/analyses/${analysis.analysisId}` :
      `${domainRoot}/api/analyses`;
    jwtFetch(url, { method, body: JSON.stringify(apiAnalysis) })
      .then(response => response.json())
      .then((data: ApiAnalysis) => {
        message.success('Analysis saved');
        this.setState({
          analysis: { ...analysis, analysisId: data.hash_id, locked: data.locked },
          unsavedChanges: false,
        });
      })
      .catch(displayError);
  }

  loadAnalysis = (data: ApiAnalysis): Promise<Analysis> => {
    const analysis: Analysis = {
      ...data,
      analysisId: data.hash_id,
      datasetId: data.dataset_id,
      runIds: data.runs.map(({ id }) => id),
      predictions: '', // TODO: remove this once predictions field is added to backend
      predictorIds: data.predictors.map(({ id }) => id),
    };
    if (analysis.runIds.length > 0) {
      jwtFetch(`${domainRoot}/api/runs/${analysis.runIds[0]}`)
        .then(response => response.json() as Promise<Run>)
        .then(data => {
          this.setState({ selectedTaskId: data.task.id });
          this.updateState('analysis', true)(analysis);
        })
        .catch(displayError);
    } else {
      this.updateState('analysis', true)(analysis);
    }
    return Promise.resolve(analysis);
  }

  confirmSubmission = (): void => {
    const { saveAnalysis } = this;
    Modal.confirm({
      title: 'Are you sure you want to submit the analysis?',
      content: `Once you submit an analysis you will no longer be able to mofidy it. 
                You will, however, be able to clone it as a starting point for a new analysis.`,
      okText: 'Yes',
      cancelText: 'No',
      onOk() {
        saveAnalysis({ locked: true })();
      },
    });
  }

  /* Main function to update application state. May split this up into
   smaller pieces if it gets too complex. 
   
   When keepClean is true, don't set unsavedChanges to true. This is useful in situations
   like loading a new analysis (loadAnalysis function) where updateState is called but
   since state changes aren't really user edits we don't want to set unsavedChanges.
   */
  updateState = (attrName: keyof Store, keepClean = false) => (value: any) => {
    const { analysis, availableRuns, availablePredictors } = this.state;
    let stateUpdate: any = {};
    if (attrName === 'analysis') {
      const updatedAnalysis: Analysis = value;
      if (updatedAnalysis.datasetId !== analysis.datasetId) {
        // If a new dataset is selected we need to fetch the associated runs
        jwtFetch(`${domainRoot}/api/runs?dataset_id=${updatedAnalysis.datasetId}`)
          .then(response => response.json())
          .then((data: Run[]) => {
            message.success(`Fetched ${data.length} runs associated with the selected dataset`);
            this.setState({
              availableRuns: data,
              availableTasks: getTasks(data),
              // availablePredictors: []
            });
          })
          .catch(displayError);
      }
      if (updatedAnalysis.runIds.length !== analysis.runIds.length) {
        // If there was any change in selection of runs, fetch the associated predictors
        const runIds = updatedAnalysis.runIds.join(',');
        if (runIds) {
          jwtFetch(`${domainRoot}/api/predictors?runs=${runIds}`)
            .then(response => response.json())
            .then((data: Predictor[]) => {
              message.success(`Fetched ${data.length} predictors associated with the selected runs`);
              this.setState({
                availablePredictors: data,
                selectedPredictors: data.filter(p => updatedAnalysis.predictorIds.indexOf(p.id) > -1)
              });
            })
            .catch(displayError);
        } else {
          stateUpdate.availablePredictors = [];
        }
      }
      // Enable predictors tab only if at least one run has been selected
      stateUpdate.predictorsActive = value.runIds.length > 0;
    } else if (attrName === 'selectedTaskId') {
      // When a different task is selected, autoselect all its associated run IDs
      this.updateState('analysis')({
        ...analysis,
        runIds: availableRuns.filter(r => r.task.id === value).map(r => r.id)
      });
    } else if (attrName === 'selectedPredictors') {
      let newAnalysis = { ...this.state.analysis };
      newAnalysis.predictorIds = value.map(p => p.id);
      stateUpdate.analysis = newAnalysis;
    }
    stateUpdate[attrName] = value;
    if(!keepClean) stateUpdate.unsavedChanges = true;
    this.setState(stateUpdate);
  }

  render() {
    const { predictorsActive, transformationsActive, contrastsActive, modelingActive,
      reviewActive, analysis, datasets, availableTasks, availableRuns,
      selectedTaskId, availablePredictors, selectedPredictors, unsavedChanges } = this.state;
    return (
      <div className="App">
        <Prompt
          when={unsavedChanges}
          message="You have unsaved changes. Are you sure you want leave this page?"
        />
        <Row type="flex" justify="center">
          <Col span={16}>
            <Button
              onClick={this.saveAnalysis({ locked: false })}
              type={this.saveEnabled() ? 'primary' : 'dashed'}
            >Save</Button>
            <Space />
            <Button
              onClick={this.confirmSubmission}
              type={this.submitEnabled() ? 'primary' : 'dashed'}
            >{unsavedChanges ? 'Save & Generate' : 'Generate'}</Button>
            <Space />
            <Button
              onClick={() => displayError(Error('Not implemented'))}
              type={this.cloneEnabled() ? 'primary' : 'dashed'}
            >Clone</Button>
          </Col>
        </Row>
        <Row type="flex" justify="center">
          <Col span={16}>
            <Tabs>
              <TabPane tab="Overview" key="1">
                <OverviewTab
                  analysis={analysis}
                  datasets={datasets}
                  availableTasks={availableTasks}
                  availableRuns={availableRuns}
                  selectedTaskId={selectedTaskId}
                  updateAnalysis={this.updateState('analysis')}
                  updateSelectedTaskId={this.updateState('selectedTaskId')}
                />
              </TabPane>
              <TabPane tab="Predictors" key="2" disabled={!predictorsActive}>
                <PredictorsTab
                  analysis={analysis}
                  availablePredictors={availablePredictors}
                  selectedPredictors={selectedPredictors}
                  updateSelectedPredictors={this.updateState('selectedPredictors')}
                />
              </TabPane>
              <TabPane tab="Transformations" key="3" disabled={!transformationsActive} />
              <TabPane tab="Contrasts" key="4" disabled={!contrastsActive} />
              <TabPane tab="Modeling" key="5" disabled={!modelingActive} />
              <TabPane tab="Review" key="6" disabled={!reviewActive}>
                <p>
                  {JSON.stringify(analysis)}
                </p>
              </TabPane>
              <TabPane tab="Status" key="7" disabled={false} />
            </Tabs>
          </Col>
        </Row>
      </div>
    );
  }
}
