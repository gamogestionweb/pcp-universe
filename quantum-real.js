const express = require('express');
const path = require('path');

const app = express();
app.use(express.json());

// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║     PCP UNIVERSE - REAL QUANTUM COMPUTER CONNECTION                           ║
// ║     IBM Quantum Platform Integration                                          ║
// ║     Discovering NEW physics from REAL quantum data                            ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

// IBM Quantum Configuration
// Set these environment variables or enter via web interface
const IBM_QUANTUM_CONFIG = {
    apiToken: process.env.IBM_QUANTUM_TOKEN || '',
    serviceCRN: process.env.IBM_SERVICE_CRN || '',
    baseUrl: 'https://quantum.cloud.ibm.com/api',
    backend: 'ibm_torino'  // Using ibm_torino
};

// Claude Opus 4.5 Configuration
// Set ANTHROPIC_API_KEY environment variable or enter via web interface
const CLAUDE_CONFIG = {
    apiKey: process.env.ANTHROPIC_API_KEY || '',
    model: 'claude-opus-4-5-20251101',
    maxTokens: 800  // Keep responses focused to save money
};
let quantumResults = [];
let experiments = [];
let aiInsights = [];
let rawQuantumData = [];

// ==================== IBM QUANTUM API ====================

async function getIBMToken() {
    // The API key needs to be exchanged for an access token
    const response = await fetch('https://iam.cloud.ibm.com/identity/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `grant_type=urn:ibm:params:oauth:grant-type:apikey&apikey=${IBM_QUANTUM_CONFIG.apiToken}`
    });

    const data = await response.json();
    if (data.access_token) {
        return data.access_token;
    }
    throw new Error('Failed to get IBM access token: ' + JSON.stringify(data));
}

async function getAvailableBackends() {
    try {
        const token = await getIBMToken();
        const response = await fetch(`${IBM_QUANTUM_CONFIG.baseUrl}/v1/backends`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });
        const data = await response.json();
        return data.devices || data;
    } catch (e) {
        console.error('Error getting backends:', e.message);
        return [];
    }
}

async function submitQuantumJob(openQasmCircuit, shots = 1000) {
    try {
        const token = await getIBMToken();

        // Primitives V2 format
        const jobPayload = {
            program_id: 'sampler',
            backend: IBM_QUANTUM_CONFIG.backend,
            params: {
                pubs: [[openQasmCircuit]],
                version: 2,
                options: {
                    default_shots: shots
                }
            }
        };

        console.log('Submitting job to', IBM_QUANTUM_CONFIG.backend);
        console.log('Payload:', JSON.stringify(jobPayload, null, 2));

        const response = await fetch(`${IBM_QUANTUM_CONFIG.baseUrl}/v1/jobs`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Service-CRN': IBM_QUANTUM_CONFIG.serviceCRN,
                'IBM-API-Version': '2025-05-01',
                'Accept': 'application/json'
            },
            body: JSON.stringify(jobPayload)
        });

        const data = await response.json();
        console.log('Job response:', JSON.stringify(data, null, 2));

        if (data.error || data.errors) {
            console.error('IBM Error:', data.error || data.errors);
        }

        return data;
    } catch (e) {
        console.error('Error submitting job:', e.message);
        throw e;
    }
}

async function getJobResult(jobId) {
    try {
        const token = await getIBMToken();

        const response = await fetch(`${IBM_QUANTUM_CONFIG.baseUrl}/v1/jobs/${jobId}/results`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Service-CRN': IBM_QUANTUM_CONFIG.serviceCRN,
                'IBM-API-Version': '2025-05-01',
                'Accept': 'application/json'
            }
        });

        return await response.json();
    } catch (e) {
        console.error('Error getting job result:', e.message);
        throw e;
    }
}

async function getJobStatus(jobId) {
    try {
        const token = await getIBMToken();

        const response = await fetch(`${IBM_QUANTUM_CONFIG.baseUrl}/v1/jobs/${jobId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Service-CRN': IBM_QUANTUM_CONFIG.serviceCRN,
                'IBM-API-Version': '2025-05-01',
                'Accept': 'application/json'
            }
        });

        return await response.json();
    } catch (e) {
        console.error('Error getting job status:', e.message);
        throw e;
    }
}

// ==================== QUANTUM CIRCUITS FOR PCP EXPERIMENTS ====================

const PCP_EXPERIMENTS = {
    // Experiment 1: Bell State - Native gates for Heron (rz, sx, x, cz)
    // H = rz(pi/2) sx rz(pi/2), CNOT = H-CZ-H on target
    bellState: {
        name: 'Bell State Entanglement',
        description: 'Create maximally entangled state and measure correlations',
        circuit: `OPENQASM 3.0;
include "stdgates.inc";
qubit[2] q;
bit[2] c;
rz(pi/2) q[0];
sx q[0];
rz(pi/2) q[0];
rz(pi/2) q[1];
sx q[1];
rz(pi/2) q[1];
cz q[0], q[1];
rz(pi/2) q[1];
sx q[1];
rz(pi/2) q[1];
c[0] = measure q[0];
c[1] = measure q[1];`,
        analysis: 'Measure correlation between qubits - should be perfectly correlated (00 or 11)'
    },

    // Experiment 2: Simple superposition and measure
    decoherence: {
        name: 'Decoherence Measurement',
        description: 'Measure how quantum state degrades - H then H should give 0',
        circuit: `OPENQASM 3.0;
include "stdgates.inc";
qubit[1] q;
bit[1] c;
rz(pi/2) q[0];
sx q[0];
rz(pi/2) q[0];
rz(pi/2) q[0];
sx q[0];
rz(pi/2) q[0];
c[0] = measure q[0];`,
        analysis: 'Should return 0 if perfect, deviation indicates decoherence'
    },

    // Experiment 3: GHZ State with native gates
    ghzState: {
        name: 'GHZ State (3 qubits)',
        description: 'Create 3-qubit entangled state - test information distribution',
        circuit: `OPENQASM 3.0;
include "stdgates.inc";
qubit[3] q;
bit[3] c;
rz(pi/2) q[0];
sx q[0];
rz(pi/2) q[0];
rz(pi/2) q[1];
sx q[1];
rz(pi/2) q[1];
cz q[0], q[1];
rz(pi/2) q[1];
sx q[1];
rz(pi/2) q[1];
rz(pi/2) q[2];
sx q[2];
rz(pi/2) q[2];
cz q[1], q[2];
rz(pi/2) q[2];
sx q[2];
rz(pi/2) q[2];
c[0] = measure q[0];
c[1] = measure q[1];
c[2] = measure q[2];`,
        analysis: 'Should only get 000 or 111 - information is globally distributed'
    },

    // Experiment 4: Scrambling with native gates
    scrambling: {
        name: 'Information Scrambling',
        description: 'Test how information spreads through quantum operations',
        circuit: `OPENQASM 3.0;
include "stdgates.inc";
qubit[3] q;
bit[3] c;
x q[0];
rz(pi/2) q[1];
sx q[1];
rz(pi/2) q[1];
cz q[0], q[1];
rz(pi/2) q[1];
sx q[1];
rz(pi/2) q[1];
rz(pi/2) q[1];
sx q[1];
rz(pi/2) q[1];
rz(pi/2) q[2];
sx q[2];
rz(pi/2) q[2];
cz q[1], q[2];
rz(pi/2) q[2];
sx q[2];
rz(pi/2) q[2];
c[0] = measure q[0];
c[1] = measure q[1];
c[2] = measure q[2];`,
        analysis: 'Information initially in q[0] should spread across all qubits'
    },

    // Experiment 5: Simple X gate reversibility
    reversibility: {
        name: 'Reversibility Test',
        description: 'Apply X then X - should return to 0',
        circuit: `OPENQASM 3.0;
include "stdgates.inc";
qubit[2] q;
bit[2] c;
x q[0];
x q[0];
x q[1];
rz(pi/2) q[1];
sx q[1];
rz(pi/2) q[1];
rz(pi/2) q[1];
sx q[1];
rz(pi/2) q[1];
x q[1];
c[0] = measure q[0];
c[1] = measure q[1];`,
        analysis: 'Perfect reversibility: should get 00. Deviations = information "cost"'
    },

    // Experiment 6: Simple 2-qubit circuit for noise
    noiseCharacterization: {
        name: 'Noise/Environment Characterization',
        description: 'Run simple circuit to characterize quantum noise',
        circuit: `OPENQASM 3.0;
include "stdgates.inc";
qubit[2] q;
bit[2] c;
rz(pi/2) q[0];
sx q[0];
rz(pi/2) q[0];
rz(pi/2) q[1];
sx q[1];
rz(pi/2) q[1];
cz q[0], q[1];
c[0] = measure q[0];
c[1] = measure q[1];`,
        analysis: 'Compare to ideal - difference reveals environment interaction'
    }
};

// ==================== AI ANALYSIS (CLAUDE OPUS 4.5) ====================

let claudeCallCount = 0;  // Track usage

async function analyzeQuantumData(experimentName, results) {
    // Check if Claude API key is configured
    if (!CLAUDE_CONFIG.apiKey) {
        console.log('⚠️ Claude API key not set - skipping analysis');
        return { error: 'Claude API key not configured. Add it in the configuration section.' };
    }

    // Use Claude Opus 4.5 for breakthrough analysis
    const systemPrompt = `You are analyzing REAL quantum computer data from IBM. Your mission: discover NEW physics humans haven't derived.

CONTEXT - Present Containment Principle (PCP):
- Present state contains ALL information of past/future
- Irreversibility is energetic, not ontological
- Information is never destroyed, only scrambled into correlations
- Landauer limit constrains information recovery

CRITICAL: This is REAL quantum data, not simulation. Look for:
- Unexpected correlations in measurement distributions
- Patterns in quantum noise (is it truly random?)
- Evidence for/against information conservation
- Mathematical relationships humans haven't noticed

Be concise. Only report genuine discoveries.`;

    const userPrompt = `EXPERIMENT: ${experimentName}
EXPECTED: ${PCP_EXPERIMENTS[experimentName]?.analysis || 'Unknown'}

RAW QUANTUM DATA:
${JSON.stringify(results, null, 2)}

Find something NEW. Skip obvious confirmations.`;

    try {
        console.log(`🧠 Calling Claude Opus 4.5 (call #${++claudeCallCount})...`);

        const res = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': CLAUDE_CONFIG.apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: CLAUDE_CONFIG.model,
                max_tokens: CLAUDE_CONFIG.maxTokens,
                messages: [
                    { role: 'user', content: systemPrompt + '\n\n' + userPrompt }
                ]
            })
        });

        const data = await res.json();

        if (data.error) {
            console.error('Claude error:', data.error);
            return { error: data.error.message };
        }

        const content = data.content?.[0]?.text;
        console.log(`✅ Claude response received (${content?.length || 0} chars)`);

        if (content) {
            // Try to parse JSON if present
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                try {
                    return JSON.parse(jsonMatch[0]);
                } catch (e) {
                    return { analysis: content };
                }
            }
            return { analysis: content };
        }
        return null;
    } catch (e) {
        console.error('Claude API error:', e.message);
        return { error: e.message };
    }
}

// Batch analysis - analyze all results at once (saves API calls)
async function analyzeAllResultsBatch() {
    if (!CLAUDE_CONFIG.apiKey) {
        return { error: 'Claude API key not configured. Add it in the configuration section.' };
    }
    if (rawQuantumData.length === 0) return { error: 'No data to analyze' };

    const systemPrompt = `You are a physicist analyzing REAL quantum computer data to discover NEW physics.

THEORY TO TEST - Present Containment Principle (PCP):
- The present contains ALL information of past/future
- Irreversibility is energetic (Landauer), not fundamental
- Information scrambles into correlations but is never lost

Analyze ALL experiments together. Look for CROSS-EXPERIMENT patterns humans miss.`;

    const dataStr = rawQuantumData.map(d =>
        `[${d.jobId}] ${JSON.stringify(d.results)}`
    ).join('\n\n');

    try {
        console.log(`🧠 Claude batch analysis (${rawQuantumData.length} experiments)...`);

        const res = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': CLAUDE_CONFIG.apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: CLAUDE_CONFIG.model,
                max_tokens: 1200,
                messages: [{
                    role: 'user',
                    content: systemPrompt + '\n\nALL QUANTUM DATA:\n' + dataStr + '\n\nWhat NEW physics do you see? Focus on unexpected cross-correlations.'
                }]
            })
        });

        const data = await res.json();
        return { analysis: data.content?.[0]?.text || data.error };
    } catch (e) {
        return { error: e.message };
    }
}

// ==================== ROUTES ====================

app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>PCP Universe - Real Quantum</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #000510 0%, #0a0020 50%, #000510 100%);
            min-height: 100vh;
            color: #fff;
            padding: 30px;
        }
        .container { max-width: 1000px; margin: 0 auto; }
        h1 {
            font-size: 2.5em;
            text-align: center;
            margin-bottom: 10px;
            background: linear-gradient(90deg, #00f0ff, #ff00ff);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .subtitle { text-align: center; color: #8080a0; margin-bottom: 30px; }

        .config-section {
            background: rgba(50, 30, 100, 0.3);
            padding: 25px;
            border-radius: 12px;
            margin-bottom: 25px;
            border: 1px solid rgba(100, 60, 200, 0.3);
        }
        .config-section h2 { color: #a080ff; margin-bottom: 15px; font-size: 1.2em; }

        input, select {
            width: 100%;
            padding: 12px;
            margin: 8px 0;
            border: 1px solid rgba(100, 60, 200, 0.5);
            border-radius: 8px;
            background: rgba(0,0,0,0.3);
            color: #fff;
            font-size: 14px;
        }
        input::placeholder { color: rgba(255,255,255,0.4); }

        button {
            padding: 14px 28px;
            margin: 8px 4px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: bold;
            transition: all 0.2s;
        }
        .btn-primary {
            background: linear-gradient(135deg, #6040c0 0%, #4020a0 100%);
            color: #fff;
        }
        .btn-quantum {
            background: linear-gradient(135deg, #00a0ff 0%, #0060a0 100%);
            color: #fff;
        }
        .btn-ai {
            background: linear-gradient(135deg, #40c080 0%, #208060 100%);
            color: #fff;
        }
        button:hover { transform: translateY(-2px); box-shadow: 0 5px 20px rgba(100,50,200,0.4); }

        .experiments-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 15px;
            margin-top: 20px;
        }
        .exp-card {
            background: rgba(30, 20, 60, 0.5);
            padding: 18px;
            border-radius: 10px;
            border: 1px solid rgba(80, 40, 120, 0.4);
        }
        .exp-card h3 { color: #00d0ff; font-size: 1em; margin-bottom: 8px; }
        .exp-card p { color: #a0a0c0; font-size: 0.85em; line-height: 1.4; }
        .exp-card button { margin-top: 12px; width: 100%; }

        #results {
            background: rgba(0,0,0,0.4);
            padding: 20px;
            border-radius: 10px;
            margin-top: 20px;
            max-height: 500px;
            overflow-y: auto;
            font-family: 'Consolas', monospace;
            font-size: 13px;
            white-space: pre-wrap;
        }

        .status { padding: 10px; border-radius: 6px; margin: 10px 0; }
        .status-success { background: rgba(40, 180, 100, 0.2); border: 1px solid #40c080; }
        .status-error { background: rgba(180, 40, 60, 0.2); border: 1px solid #c04060; }
        .status-pending { background: rgba(180, 140, 40, 0.2); border: 1px solid #c0a040; }

        .insight-card {
            background: rgba(40, 120, 100, 0.3);
            padding: 15px;
            border-radius: 8px;
            margin: 10px 0;
            border-left: 3px solid #40c0a0;
        }
        .insight-card h4 { color: #60e0c0; margin-bottom: 8px; }
        .insight-card p { color: #a0d0c0; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔬 PCP UNIVERSE - QUANTUM REAL</h1>
        <p class="subtitle">Conectado a IBM Quantum Platform - Ordenador Cuántico Real</p>

        <div class="config-section">
            <h2>⚡ Configuración</h2>
            <input type="password" id="ibmToken" placeholder="IBM Quantum API Token" />
            <input type="text" id="serviceCRN" placeholder="Service CRN (crn:v1:bluemix:public:quantum-computing:...)" />
            <input type="password" id="claudeApiKey" placeholder="Claude Opus 4.5 API Key (sk-ant-...)" />
            <button class="btn-primary" onclick="saveConfig()">Guardar Configuración</button>
            <button class="btn-quantum" onclick="testConnection()">Probar Conexión IBM</button>
        </div>

        <div class="config-section">
            <h2>🧪 Experimentos Cuánticos Reales</h2>
            <p style="color:#a080c0;margin-bottom:15px;">Cada experimento se ejecuta en un ordenador cuántico REAL de IBM</p>

            <div class="experiments-grid">
                <div class="exp-card">
                    <h3>🔗 Bell State</h3>
                    <p>Crear estado entrelazado máximo y medir correlaciones cuánticas reales.</p>
                    <button class="btn-quantum" onclick="runExperiment('bellState')">Ejecutar</button>
                </div>

                <div class="exp-card">
                    <h3>📉 Decoherencia</h3>
                    <p>Medir cómo el estado cuántico se degrada - evidencia de "pérdida" de información.</p>
                    <button class="btn-quantum" onclick="runExperiment('decoherence')">Ejecutar</button>
                </div>

                <div class="exp-card">
                    <h3>🌐 GHZ State</h3>
                    <p>Estado de 3 qubits entrelazados - información distribuida globalmente.</p>
                    <button class="btn-quantum" onclick="runExperiment('ghzState')">Ejecutar</button>
                </div>

                <div class="exp-card">
                    <h3>🌀 Scrambling</h3>
                    <p>Cómo la información se dispersa a través de operaciones cuánticas.</p>
                    <button class="btn-quantum" onclick="runExperiment('scrambling')">Ejecutar</button>
                </div>

                <div class="exp-card">
                    <h3>⏪ Reversibilidad</h3>
                    <p>Aplicar operaciones y revertir - ¿se conserva la información?</p>
                    <button class="btn-quantum" onclick="runExperiment('reversibility')">Ejecutar</button>
                </div>

                <div class="exp-card">
                    <h3>📊 Caracterización Ruido</h3>
                    <p>Medir el ruido cuántico real - interacción con el ambiente.</p>
                    <button class="btn-quantum" onclick="runExperiment('noiseCharacterization')">Ejecutar</button>
                </div>
            </div>
        </div>

        <div class="config-section">
            <h2>📥 Recuperar Resultados</h2>
            <input type="text" id="jobIdInput" placeholder="Job ID (ej: d5d3b97p3tbc73avisbg)" />
            <button class="btn-quantum" onclick="fetchJobResults()">Obtener Resultados</button>
        </div>

        <div class="config-section">
            <h2>🧠 Análisis AI (Claude Opus 4.5)</h2>
            <button class="btn-ai" onclick="batchAnalyze()">Análisis Global (1 llamada)</button>
            <button class="btn-primary" onclick="generateReport()">📄 GENERAR INFORME CIENTÍFICO</button>
            <button class="btn-primary" onclick="getInsights()">Ver Insights</button>
            <button onclick="checkUsage()" style="background:#333;color:#aaa;">💰 Ver Uso API</button>
        </div>

        <div id="results">
            <span style="color:#8080a0;">Los resultados de los experimentos cuánticos aparecerán aquí...</span>
        </div>
    </div>

    <script>
        const resultsDiv = document.getElementById('results');

        function log(msg, type = 'info') {
            const colors = { info: '#a0a0ff', success: '#60e0a0', error: '#e06080', quantum: '#00d0ff' };
            resultsDiv.innerHTML += '<div style="color:' + colors[type] + ';margin:5px 0;">' + msg + '</div>';
            resultsDiv.scrollTop = resultsDiv.scrollHeight;
        }

        async function saveConfig() {
            const ibmToken = document.getElementById('ibmToken').value;
            const serviceCRN = document.getElementById('serviceCRN').value;
            const claudeApiKey = document.getElementById('claudeApiKey').value;

            const res = await fetch('/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ibmToken, serviceCRN, claudeApiKey })
            });
            const data = await res.json();
            log(data.ok ? '✅ Configuración guardada' : '❌ Error: ' + data.error, data.ok ? 'success' : 'error');
        }

        async function testConnection() {
            log('🔌 Probando conexión con IBM Quantum...', 'quantum');
            const res = await fetch('/test-connection');
            const data = await res.json();
            if (data.ok) {
                log('✅ Conectado a IBM Quantum', 'success');
                log('Backends disponibles: ' + JSON.stringify(data.backends?.slice(0,5) || data), 'info');
            } else {
                log('❌ Error de conexión: ' + data.error, 'error');
            }
        }

        async function runExperiment(name) {
            log('🚀 Enviando experimento "' + name + '" al ordenador cuántico...', 'quantum');
            const res = await fetch('/run-experiment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ experiment: name })
            });
            const data = await res.json();
            if (data.ok) {
                log('✅ Job enviado: ' + data.jobId, 'success');
                log('⏳ Esperando resultados... (puede tardar unos minutos)', 'info');
                pollJobStatus(data.jobId, name);
            } else {
                log('❌ Error: ' + data.error, 'error');
            }
        }

        async function pollJobStatus(jobId, experimentName) {
            const check = async () => {
                const res = await fetch('/job-status/' + jobId);
                const data = await res.json();
                log('📊 Estado del job: ' + data.status, 'info');

                if (data.status === 'DONE' || data.status === 'COMPLETED') {
                    log('✅ Experimento completado!', 'success');
                    log('📈 Resultados:\\n' + JSON.stringify(data.results, null, 2), 'quantum');

                    // Auto-analyze
                    log('🧠 Analizando resultados con AI...', 'info');
                    const analysisRes = await fetch('/analyze', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ experiment: experimentName, results: data.results })
                    });
                    const analysis = await analysisRes.json();
                    if (analysis.insight) {
                        log('🔮 INSIGHT AI:\\n' + JSON.stringify(analysis.insight, null, 2), 'success');
                    }
                } else if (data.status === 'FAILED' || data.status === 'CANCELLED') {
                    log('❌ Job falló: ' + JSON.stringify(data), 'error');
                } else {
                    setTimeout(check, 10000); // Check again in 10s
                }
            };
            check();
        }

        async function fetchJobResults() {
            const jobId = document.getElementById('jobIdInput').value.trim();
            if (!jobId) {
                log('❌ Introduce un Job ID', 'error');
                return;
            }
            log('📥 Obteniendo resultados del job ' + jobId + '...', 'quantum');
            const res = await fetch('/fetch-results/' + jobId);
            const data = await res.json();
            if (data.results) {
                log('✅ RESULTADOS OBTENIDOS:', 'success');
                log(JSON.stringify(data.results, null, 2), 'quantum');
                if (data.analysis) {
                    log('🧠 ANÁLISIS CLAUDE:', 'success');
                    log(data.analysis, 'success');
                }
            } else {
                log('❌ Error: ' + JSON.stringify(data), 'error');
            }
        }

        async function batchAnalyze() {
            log('🧠 Análisis global con Claude Opus 4.5...', 'info');
            const res = await fetch('/batch-analyze');
            const data = await res.json();
            log('🔮 ANÁLISIS CLAUDE:\\n' + (data.analysis || JSON.stringify(data, null, 2)), 'success');
        }

        async function generateReport() {
            log('📄 Generando informe científico con Claude Opus 4.5...', 'info');
            log('⏳ Esto puede tardar unos segundos...', 'info');
            const res = await fetch('/generate-report');
            const data = await res.json();
            if (data.report) {
                log('═══════════════════════════════════════════════════════════════', 'quantum');
                log('📄 INFORME CIENTÍFICO PCP', 'quantum');
                log('═══════════════════════════════════════════════════════════════', 'quantum');
                log('Backend: ' + data.ibmBackend, 'info');
                log('Experimentos: ' + data.experimentsCount, 'info');
                log('Llamadas Claude: ' + data.claudeCallsUsed, 'info');
                log('───────────────────────────────────────────────────────────────', 'info');
                log(data.report, 'success');
                log('═══════════════════════════════════════════════════════════════', 'quantum');
            } else {
                log('Error: ' + JSON.stringify(data), 'error');
            }
        }

        async function getInsights() {
            const res = await fetch('/insights');
            const data = await res.json();
            log('🔮 INSIGHTS DESCUBIERTOS:\\n' + JSON.stringify(data, null, 2), 'quantum');
        }

        async function checkUsage() {
            const res = await fetch('/usage');
            const data = await res.json();
            log('💰 USO API CLAUDE:\\n' +
                '  Llamadas: ' + data.claudeCalls + '\\n' +
                '  Costo estimado: ' + data.estimatedCost + '\\n' +
                '  Presupuesto restante: ' + data.remainingBudget + '\\n' +
                '  Experimentos: ' + data.experimentsRun + '\\n' +
                '  Datos recogidos: ' + data.dataCollected, 'info');
        }
    </script>
</body>
</html>
    `);
});

app.use(express.static(path.join(__dirname, 'public')));

app.post('/config', (req, res) => {
    const { ibmToken, serviceCRN, claudeApiKey } = req.body;

    if (ibmToken) IBM_QUANTUM_CONFIG.apiToken = ibmToken;
    if (serviceCRN) IBM_QUANTUM_CONFIG.serviceCRN = serviceCRN;
    if (claudeApiKey) CLAUDE_CONFIG.apiKey = claudeApiKey;

    console.log('✅ Configuration updated');
    console.log('  IBM Token:', ibmToken ? '****' + ibmToken.slice(-4) : '(not set)');
    console.log('  Claude API:', claudeApiKey ? '****' + claudeApiKey.slice(-4) : '(not set)');
    res.json({ ok: true });
});

app.get('/test-connection', async (req, res) => {
    try {
        if (!IBM_QUANTUM_CONFIG.apiToken) {
            return res.json({ ok: false, error: 'IBM API token not set' });
        }

        const backends = await getAvailableBackends();
        res.json({ ok: true, backends });
    } catch (e) {
        res.json({ ok: false, error: e.message });
    }
});

app.post('/run-experiment', async (req, res) => {
    try {
        const { experiment } = req.body;

        if (!PCP_EXPERIMENTS[experiment]) {
            return res.json({ ok: false, error: 'Unknown experiment' });
        }

        if (!IBM_QUANTUM_CONFIG.apiToken || !IBM_QUANTUM_CONFIG.serviceCRN) {
            return res.json({ ok: false, error: 'IBM credentials not configured' });
        }

        const circuit = PCP_EXPERIMENTS[experiment].circuit;
        const result = await submitQuantumJob(circuit, 1000);

        experiments.push({
            name: experiment,
            jobId: result.id,
            submittedAt: new Date().toISOString(),
            status: 'PENDING'
        });

        res.json({ ok: true, jobId: result.id });
    } catch (e) {
        res.json({ ok: false, error: e.message });
    }
});

app.get('/job-status/:jobId', async (req, res) => {
    try {
        const status = await getJobStatus(req.params.jobId);

        let results = null;
        if (status.status === 'DONE' || status.status === 'COMPLETED') {
            results = await getJobResult(req.params.jobId);
            rawQuantumData.push({
                jobId: req.params.jobId,
                results,
                timestamp: new Date().toISOString()
            });
        }

        res.json({ status: status.status, results });
    } catch (e) {
        res.json({ error: e.message });
    }
});

// Fetch results manually by job ID
app.get('/fetch-results/:jobId', async (req, res) => {
    try {
        const jobId = req.params.jobId;
        console.log('📥 Fetching results for job:', jobId);

        const results = await getJobResult(jobId);
        console.log('Results:', JSON.stringify(results, null, 2));

        // Store in rawQuantumData
        rawQuantumData.push({
            jobId,
            results,
            timestamp: new Date().toISOString()
        });

        // Auto-analyze with Claude
        const analysis = await analyzeQuantumData('manual', results);

        if (analysis && !analysis.error) {
            aiInsights.push({
                jobId,
                insight: analysis,
                timestamp: new Date().toISOString()
            });
        }

        res.json({
            ok: true,
            results,
            analysis: analysis?.analysis || analysis
        });
    } catch (e) {
        console.error('Error fetching results:', e.message);
        res.json({ error: e.message });
    }
});

app.post('/analyze', async (req, res) => {
    try {
        const { experiment, results } = req.body;
        const insight = await analyzeQuantumData(experiment, results);

        if (insight) {
            aiInsights.push({
                experiment,
                insight,
                timestamp: new Date().toISOString()
            });
        }

        res.json({ ok: true, insight });
    } catch (e) {
        res.json({ ok: false, error: e.message });
    }
});

app.get('/analyze-all', async (req, res) => {
    res.json({
        experiments: experiments.length,
        rawData: rawQuantumData.length,
        insights: aiInsights.length
    });
});

app.get('/insights', (req, res) => {
    res.json(aiInsights);
});

app.get('/raw-data', (req, res) => {
    res.json(rawQuantumData);
});

app.get('/batch-analyze', async (req, res) => {
    try {
        const result = await analyzeAllResultsBatch();
        if (result.analysis) {
            aiInsights.push({
                type: 'batch_analysis',
                insight: result.analysis,
                timestamp: new Date().toISOString(),
                experimentsAnalyzed: rawQuantumData.length
            });
        }
        res.json(result);
    } catch (e) {
        res.json({ error: e.message });
    }
});

app.get('/generate-report', async (req, res) => {
    // Check Claude API key
    if (!CLAUDE_CONFIG.apiKey) {
        return res.json({ error: 'Claude API key not configured. Add it in the configuration section.' });
    }

    // Generate comprehensive PCP validation report using Claude
    const reportPrompt = `You are writing a SCIENTIFIC REPORT on experiments conducted on a REAL IBM quantum computer to test the Present Containment Principle (PCP).

THE THEORY (PCP):
The present physical state contains ALL information needed to reconstruct any past or future state. Irreversibility is not ontological but epistemological/energetic. Information is never destroyed, only scrambled into correlations. Recovery cost follows Landauer's limit: W ≥ kT·ln(2)·bits.

EXPERIMENTS CONDUCTED:
${experiments.map(e => `- ${e.name}: Job ${e.jobId} (${e.status})`).join('\n')}

RAW QUANTUM DATA:
${JSON.stringify(rawQuantumData, null, 2)}

PREVIOUS AI INSIGHTS:
${aiInsights.map(i => JSON.stringify(i.insight)).join('\n\n')}

Write a scientific report with:
1. ABSTRACT - Summary of findings
2. METHODOLOGY - What experiments were run
3. RESULTS - Key measurements from real quantum hardware
4. ANALYSIS - What patterns/anomalies were found
5. PCP IMPLICATIONS - Does data support/extend/challenge PCP?
6. NEW PHYSICS - Any unexpected discoveries
7. CONCLUSIONS - Final assessment

Be rigorous. This is for a Zenodo publication.`;

    try {
        console.log('📄 Generating comprehensive report with Claude Opus 4.5...');

        const res_api = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': CLAUDE_CONFIG.apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: CLAUDE_CONFIG.model,
                max_tokens: 2000,
                messages: [{ role: 'user', content: reportPrompt }]
            })
        });

        const data = await res_api.json();
        const report = data.content?.[0]?.text || 'Error generating report';

        // Save report
        const fullReport = {
            title: 'PCP Validation via Real Quantum Computer Experiments',
            generatedAt: new Date().toISOString(),
            ibmBackend: IBM_QUANTUM_CONFIG.backend,
            experimentsCount: experiments.length,
            rawDataPoints: rawQuantumData.length,
            insightsGenerated: aiInsights.length,
            claudeCallsUsed: claudeCallCount,
            report: report
        };

        res.json(fullReport);
    } catch (e) {
        res.json({ error: e.message });
    }
});

app.get('/usage', (req, res) => {
    // Track Claude API usage for budget management
    res.json({
        claudeCalls: claudeCallCount,
        estimatedCost: (claudeCallCount * 0.015).toFixed(3) + ' EUR',  // ~$0.015 per call estimate
        remainingBudget: (2.9 - claudeCallCount * 0.015).toFixed(2) + ' EUR',
        experimentsRun: experiments.length,
        dataCollected: rawQuantumData.length
    });
});

// ==================== SERVER ====================
const PORT = 3002;
app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════════════════════════╗
║     🔬 PCP UNIVERSE - REAL QUANTUM COMPUTER                                   ║
║     IBM Quantum Platform Integration                                          ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║  Conecta a un ordenador cuántico REAL para descubrir física NUEVA            ║
║  Los datos son REALES - no simulados                                          ║
╚═══════════════════════════════════════════════════════════════════════════════╝

Servidor: http://localhost:${PORT}

Experimentos disponibles:
• Bell State - Entrelazamiento cuántico
• Decoherencia - Pérdida de información
• GHZ State - Correlaciones multi-qubit
• Scrambling - Dispersión de información
• Reversibilidad - Conservación de información
• Caracterización de ruido

`);
});
