// GHZ State - 3-qubit maximally entangled state
// Creates |000> + |111> superposition
// Native Heron gates for IBM Torino
OPENQASM 3.0;
include "stdgates.inc";
qubit[3] q;
bit[3] c;

// H gate on q[0]: creates |0> + |1>
rz(pi/2) q[0];
sx q[0];
rz(pi/2) q[0];

// CNOT(0,1) = H(1) CZ(0,1) H(1)
rz(pi/2) q[1];
sx q[1];
rz(pi/2) q[1];
cz q[0], q[1];
rz(pi/2) q[1];
sx q[1];
rz(pi/2) q[1];

// CNOT(1,2) = H(2) CZ(1,2) H(2)
rz(pi/2) q[2];
sx q[2];
rz(pi/2) q[2];
cz q[1], q[2];
rz(pi/2) q[2];
sx q[2];
rz(pi/2) q[2];

// Measure all qubits
c[0] = measure q[0];
c[1] = measure q[1];
c[2] = measure q[2];
