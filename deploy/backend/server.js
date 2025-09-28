const express = require('express');
const fs = require('fs');
const path = require('path');
const morgan = require('morgan');

const app = express();
app.use(express.json({limit: '100kb'}));
app.use(morgan('combined'));

const LOG_DIR = process.env.LOG_DIR || '/var/log/bcp';
if(!fs.existsSync(LOG_DIR)){
  try{ fs.mkdirSync(LOG_DIR, { recursive: true, mode: 0o755 }); }catch(e){ console.warn('Could not create log dir', e.message); }
}

app.post('/api/perf', (req, res) => {
  try{
    const payload = req.body || {};
    const line = JSON.stringify({t:new Date().toISOString(), ...payload}) + '\n';
    const file = path.join(LOG_DIR, 'perf.log');
    fs.appendFile(file, line, (err) => {
      if(err) {
        console.error('Failed to write perf log', err);
        try{ if (process.env.SENTRY_DSN) require('@sentry/node').captureException(err); }catch(e){}
        return res.status(500).json({ok:false});
      }
      return res.json({ok:true});
    });
  }catch(e){
    console.error('Error handling /api/perf', e);
    try{ if (process.env.SENTRY_DSN) require('@sentry/node').captureException(e); }catch(e){}
    return res.status(500).json({ok:false});
  }
});

app.get('/health', (req,res)=> res.json({ok:true,ts:Date.now()}));

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Perf backend listening on ${port}`));

// Initialize Sentry (optional) for backend error reporting
try{
  const SENTRY_DSN = process.env.SENTRY_DSN;
  if(SENTRY_DSN){
    const Sentry = require('@sentry/node');
    Sentry.init({ dsn: SENTRY_DSN });
    console.log('Sentry initialized for backend');
    // Capture unhandled exceptions
    app.use((err, req, res, next) => {
      try { Sentry.captureException(err); } catch(e){}
      next(err);
    });
  }
}catch(e){ console.warn('Sentry init failed', e && e.message); }
