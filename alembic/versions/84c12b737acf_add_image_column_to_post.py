"""add image column to Post

Revision ID: 84c12b737acf
Revises: 
Create Date: 2026-03-03 23:25:07.848589
"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '84c12b737acf'
down_revision = None
branch_labels = None
depends_on = None

def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        'posts',  # table name
        sa.Column('image', sa.String(), nullable=True)
    )

def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('posts', 'image')