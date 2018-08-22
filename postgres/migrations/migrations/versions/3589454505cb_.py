"""empty message

Revision ID: 3589454505cb
Revises: a5e1fbca2504
Create Date: 2018-07-20 22:29:10.264463

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '3589454505cb'
down_revision = 'a5e1fbca2504'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('extracted_feature', sa.Column('modality', sa.String(), nullable=True))
    op.add_column('predictor', sa.Column('description', sa.Text(), nullable=True))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('predictor', 'description')
    op.drop_column('extracted_feature', 'modality')
    # ### end Alembic commands ###