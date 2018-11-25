"""empty message

Revision ID: f991ae1b4c35
Revises: 8324c6661b5a
Create Date: 2018-11-24 21:36:55.690183

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'f991ae1b4c35'
down_revision = '8324c6661b5a'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('analysis', sa.Column('submitted_at', sa.DateTime(), nullable=True))
    op.drop_column('analysis', 'compiled_at')
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('analysis', sa.Column('compiled_at', postgresql.TIMESTAMP(), autoincrement=False, nullable=True))
    op.drop_column('analysis', 'submitted_at')
    # ### end Alembic commands ###
