import sys
from pathlib import Path

# Add workspace root to sys.path so aegis package is always importable on Vercel
root_dir = Path(__file__).resolve().parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from aegis.main import app
