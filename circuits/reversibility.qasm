// Reversibility Test
// q[0]: X followed by X should return to |0>
// q[1]: X, H, H, X should also return to |0>
// Tests if quantum operations are truly reversible
OPENQASM 3.0;
include "stdgates.inc";
qubit[2] q;
bit[2] c;

// q[0]: Simple X-X test
x q[0];
x q[0];

// q[1]: More complex reversibility
x q[1];
// H gate
rz(pi/2) q[1];
sx q[1];
rz(pi/2) q[1];
// H gate again (undoes first H)
rz(pi/2) q[1];
sx q[1];
rz(pi/2) q[1];
// X gate (undoes first X)
x q[1];

// Both should measure as |0>
c[0] = measure q[0];
c[1] = measure q[1];
