"""empty message

Revision ID: 0c7b8157b950
Revises: 2474c993e37a
Create Date: 2018-09-20 22:46:02.159520

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '0c7b8157b950'
down_revision = '2474c993e37a'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('report',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('analysis_id', sa.Text(), nullable=True),
    sa.Column('runs', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
    sa.Column('generated_at', sa.DateTime(), nullable=True),
    sa.Column('task_id', sa.Text(), nullable=True),
    sa.Column('result', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
    sa.Column('status', sa.Text(), nullable=True),
    sa.CheckConstraint("status IN ('OK', 'FAILED', 'PENDING')"),
    sa.ForeignKeyConstraint(['analysis_id'], ['analysis.hash_id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('report')
    # ### end Alembic commands ###