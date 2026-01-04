// Information Scrambling Test
// Initial information in q[0] should spread to correlations
// Tests PCP claim that information is redistributed, not destroyed
OPENQASM 3.0;
include "stdgates.inc";
qubit[3] q;
bit[3] c;

// Set q[0] to |1> - this is our "information"
x q[0];

// H gate on q[1]
rz(pi/2) q[1];
sx q[1];
rz(pi/2) q[1];

// CNOT(0,1) - spreads info from q[0] to q[1]
cz q[0], q[1];
rz(pi/2) q[1];
sx q[1];
rz(pi/2) q[1];

// H gate on q[1] again
rz(pi/2) q[1];
sx q[1];
rz(pi/2) q[1];

// H gate on q[2]
rz(pi/2) q[2];
sx q[2];
rz(pi/2) q[2];

// CNOT(1,2) - spreads info further
cz q[1], q[2];
rz(pi/2) q[2];
sx q[2];
rz(pi/2) q[2];

// Measure - information should be in correlations
c[0] = measure q[0];
c[1] = measure q[1];
c[2] = measure q[2];
