"""empty message

Revision ID: 411caa1af7db
Revises: 8324c6661b5a
Create Date: 2018-10-16 20:45:38.583624

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '411caa1af7db'
down_revision = '8324c6661b5a'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('user', sa.Column('google_id', sa.Text(), nullable=True))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('user', 'google_id')
    # ### end Alembic commands ###