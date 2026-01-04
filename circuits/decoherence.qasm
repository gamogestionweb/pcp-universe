// Decoherence Test - H gate applied twice should return to |0>
// Native Heron gates: H = rz(pi/2) sx rz(pi/2)
OPENQASM 3.0;
include "stdgates.inc";
qubit[1] q;
bit[1] c;

// First H gate
rz(pi/2) q[0];
sx q[0];
rz(pi/2) q[0];

// Second H gate (should undo the first)
rz(pi/2) q[0];
sx q[0];
rz(pi/2) q[0];

// Measure - should always be 0 in ideal case
c[0] = measure q[0];
