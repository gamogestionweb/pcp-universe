// Noise Characterization
// Create equal superposition of all 2-qubit states
// Expected: 25% each of 00, 01, 10, 11
// Deviations reveal noise structure
OPENQASM 3.0;
include "stdgates.inc";
qubit[2] q;
bit[2] c;

// H gate on q[0]
rz(pi/2) q[0];
sx q[0];
rz(pi/2) q[0];

// H gate on q[1]
rz(pi/2) q[1];
sx q[1];
rz(pi/2) q[1];

// CZ gate - creates entanglement
cz q[0], q[1];

// Measure both
c[0] = measure q[0];
c[1] = measure q[1];
