
### Updae this to bootstrap from OpenfMRI and create some relistic data fixtures
### To be run in command line so perhaps this can go in manage.py?
### Discuss with Tal
from app import app, db
from models import Dataset, Analysis, user_datastore
from flask_security.utils import encrypt_password

# Bootstrap 
def create_test_models():
    user_datastore.create_user(email='test', password=encrypt_password('test'))
    user_datastore.create_user(email='test2', password=encrypt_password('test2'))

    ds = Dataset(name='test_fmri', external_id='ds_30')
    an = Analysis(dataset_id=1, name="test_fmri_analysis", description="some crazy shit")
    db.session.add(ds)
    db.session.add(an)
    db.session.commit()

if __name__ == '__main__':
	with app.app_context():
		create_test_models()
		db.create_all()