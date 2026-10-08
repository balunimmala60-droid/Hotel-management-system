import express from 'express';
import { createServer as createViteServer } from 'vite';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to execute Python backend RPC commands
function runPythonRpc(action: string, params: Record<string, any> = {}): Promise<any> {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, 'backend', 'hotel_backend.py');
    const pythonBin = process.env.PYTHON_BIN || (process.platform === 'win32' ? 'python' : 'python3');
    
    let pythonProc;
    try {
      pythonProc = spawn(pythonBin, [scriptPath, 'rpc']);
    } catch (e: any) {
      return reject(new Error(`Could not spawn ${pythonBin}: ${e.message}`));
    }

    let stdout = '';
    let stderr = '';

    pythonProc.stdin.write(JSON.stringify({ action, params }));
    pythonProc.stdin.end();

    pythonProc.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    pythonProc.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    pythonProc.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(`Python process exited with code ${code}: ${stderr || stdout}`));
      }
      try {
        const parsed = JSON.parse(stdout.trim());
        resolve(parsed);
      } catch (e: any) {
        reject(new Error(`Failed to parse Python output: ${stdout} (error: ${e.message})`));
      }
    });

    pythonProc.on('error', (err) => {
      // If python3 failed with ENOENT on Windows or Linux, attempt fallback to 'python'
      if ((err as any).code === 'ENOENT' && pythonBin === 'python3') {
        const fallbackProc = spawn('python', [scriptPath, 'rpc']);
        let fbStdout = '';
        let fbStderr = '';
        fallbackProc.stdin.write(JSON.stringify({ action, params }));
        fallbackProc.stdin.end();
        fallbackProc.stdout.on('data', (d) => { fbStdout += d.toString(); });
        fallbackProc.stderr.on('data', (d) => { fbStderr += d.toString(); });
        fallbackProc.on('close', (c) => {
          if (c !== 0) return reject(new Error(`Python fallback exited with code ${c}: ${fbStderr}`));
          try {
            resolve(JSON.parse(fbStdout.trim()));
          } catch (pe: any) {
            reject(new Error(`Failed to parse Python fallback output: ${pe.message}`));
          }
        });
        fallbackProc.on('error', (fallbackErr) => {
          reject(new Error(`Python execution failed (tried python3 & python): ${fallbackErr.message}`));
        });
      } else {
        reject(err);
      }
    });
  });
}

async function startServer() {
  const app = express();
  
  // Trust proxy for GitHub Codespaces, Cloud Run, and preview proxies
  app.set('trust proxy', 1);

  // Enable CORS headers for preview environments and codespaces
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  app.use(express.json());

  const PORT = Number(process.env.PORT) || 3000;

  // Initialize DB on start
  try {
    await runPythonRpc('init', { force: false });
    console.log('Hotel database initialized and verified.');
  } catch (err) {
    console.warn('Initial DB init notice (backend will continue):', err);
  }

  // Health check endpoint for GitHub preview / proxy monitors
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'Grand Horizon Luxury Hotel Management System',
      currency: 'INR (₹)',
      timestamp: new Date().toISOString()
    });
  });

  // 1. Get all hotel data
  app.get('/api/hotel/all', async (_req, res) => {
    try {
      const data = await runPythonRpc('get_all');
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 2. Get hotel KPI summary
  app.get('/api/hotel/summary', async (_req, res) => {
    try {
      const summary = await runPythonRpc('get_summary');
      res.json({ success: true, summary });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 3. Get Folio details
  app.get('/api/hotel/folio/:id', async (req, res) => {
    try {
      const folio = await runPythonRpc('get_folio', { booking_id: req.params.id });
      res.json({ success: true, folio });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 4. Create new booking
  app.post('/api/hotel/booking', async (req, res) => {
    try {
      const result = await runPythonRpc('create_booking', req.body);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 5. Check-in
  app.post('/api/hotel/checkin', async (req, res) => {
    try {
      const result = await runPythonRpc('check_in', req.body);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 6. Check-out
  app.post('/api/hotel/checkout', async (req, res) => {
    try {
      const result = await runPythonRpc('check_out', req.body);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 7. Add charge to folio
  app.post('/api/hotel/folio/charge', async (req, res) => {
    try {
      const result = await runPythonRpc('add_folio_charge', req.body);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 8. Add payment to folio
  app.post('/api/hotel/folio/pay', async (req, res) => {
    try {
      const result = await runPythonRpc('add_payment', req.body);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 9. Update room status / cleanliness
  app.post('/api/hotel/rooms/status', async (req, res) => {
    try {
      const result = await runPythonRpc('update_room_status', req.body);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 10. Housekeeping tasks
  app.post('/api/hotel/housekeeping/status', async (req, res) => {
    try {
      const result = await runPythonRpc('update_task_status', req.body);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/hotel/housekeeping/new', async (req, res) => {
    try {
      const result = await runPythonRpc('create_task', req.body);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 11. Run SQL Query
  app.post('/api/hotel/sql', async (req, res) => {
    try {
      const { query } = req.body;
      const result = await runPythonRpc('execute_sql', { query });
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 12. Run Python Code
  app.post('/api/hotel/python', async (req, res) => {
    try {
      const { code } = req.body;
      const result = await runPythonRpc('run_python', { code });
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 13. Reset Database to seed state
  app.post('/api/hotel/reset-db', async (_req, res) => {
    try {
      const result = await runPythonRpc('init', { force: true });
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 14. Get raw source files (Python code and SQL schema for downloading or inspection)
  app.get('/api/hotel/source/:type', (req, res) => {
    const { type } = req.params;
    let filePath = '';
    if (type === 'python') {
      filePath = path.join(__dirname, 'backend', 'hotel_backend.py');
    } else if (type === 'sql') {
      filePath = path.join(__dirname, 'backend', 'schema.sql');
    }

    if (filePath && fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      res.json({ success: true, content, filename: path.basename(filePath) });
    } else {
      res.status(404).json({ success: false, error: 'File not found' });
    }
  });

  // Mount Vite dev server or static files
  const isProduction = process.env.NODE_ENV === 'production' && fs.existsSync(path.join(__dirname, 'dist'));
  if (isProduction) {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        allowedHosts: true, // Allow GitHub codespaces and preview hosts
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Hotel Management System active on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
