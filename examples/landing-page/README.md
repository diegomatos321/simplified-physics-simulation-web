# Simplified Physics Simulation on the Web

This repository contains the final paper for a Bachelor's degree in Computer Science at the Federal University of Rio de Janeiro. It features an implementation of Position-Based Projection using Jakobsen's method and a 2D physics engine rendered with WebGL.

The physics engine can run in two modes:

- **SAT-based mode:** Powered by the Separating Axis Theorem (SAT) for collision detection. Collision resolution is handled by Jakobsen's method after calculating the Minimum Translation Vector (MTV) and correctly projecting the points/particles. This works very well in 2D.
- **GJK/EPA-based mode:** Powered by the Gilbert–Johnson–Keerthi (GJK) algorithm for collision detection and the Expanding Polytope Algorithm (EPA) for calculating the MTV. Collision resolution is then performed in the same way as in SAT mode. This works very well in both 2D and 3D.
