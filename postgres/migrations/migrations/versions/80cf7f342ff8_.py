"""empty message

Revision ID: 80cf7f342ff8
Revises: 8ef48148a25b
Create Date: 2018-09-10 21:22:55.484343

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '80cf7f342ff8'
down_revision = '8ef48148a25b'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('analysis', sa.Column('locked', sa.Boolean(), nullable=True))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('analysis', 'locked')
    # ### end Alembic commands ###
