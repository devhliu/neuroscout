# Neuroscout-cli

The Neuroscout Command Line Interface (_neuroscout-cli_) allows you to easily execute analyses created on [neuroscout.org](https://www.neuroscout.org).

_neuroscout-cli_ makes it easy to run your analysis with no configuration by fetching a self-contained analysis bundle, and downloading the required preprocessed fMRI data at run time using [DataLad](https://www.datalad.org/). _neuroscout-cli_ internally uses [FitLins](https://github.com/poldracklab/fitlins), a python pipeline for fMRI analysis in BIDS, to fits a statistical model to the fMRI data, and produce comprehensive reports. _neuroscout-cli_ automaticallys upload the fitted images to [Neurovault](https://www.datalad.org/), and links them to the analysis listing, making it easy to view and share your results.

## Installation

The recommended way to use the _neuroscout-cli_ is using a Docker Container. Docker Containers greatly facilitate the management of software dependencies, and increase reproducibility of results.

### Docker Container

In order to run _neuroscout-cli_ in a Docker Container, you must first install [Docker](https://docs.docker.com/engine/installation/).

Once Docker is is installed, pull down the latest _neuroscout-cli_ Docker image:

    docker pull neuroscout/neuroscout-cli

### Manual installation

!!! Danger
    Manually installing _neuroscout-cli_ is not currently recommended. Proceed only if you really need to do this.

Use pip to install _neuroscout-cli_ directly from the github repo:

    pip install -e git+https://www.github.com/neuroscout/neuroscout-cli#egg=neuroscout_cli
