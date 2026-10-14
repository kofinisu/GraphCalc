```markdown
# GraphCalc Pro

A self-contained, single-file graphing and algebra calculator inspired by Desmos.
No build step, no dependencies, no server — just open `index.html` or open it on my GitHub Page.

---

## Table of Contents

- [Quick Start](#quick-start)
- [Graphing Engine](#graphing-engine)
- [Expression Types](#expression-types)
- [Interactive Graph Features](#interactive-graph-features)
- [Sliders & Variables](#sliders--variables)
- [Scientific Calculator](#scientific-calculator)
- [Algebra Tools](#algebra-tools)
- [Examples Library](#examples-library)
- [Save / Load / Export](#save--load--export)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Supported Syntax Reference](#supported-syntax-reference)
- [Known Limitations](#known-limitations)
- [Deployment to GitHub Pages](#deployment-to-github-pages)

---

## Quick Start

```bash
git clone https://github.com/kofinisu/graphcalc.git
cd graphcalc
# Just open the file — no build required
open index.html
```

Or visit the live demo at https://kofinisu.github.io/graphcalc/.

---

Graphing Engine

· Canvas 2D renderer with device-pixel-ratio scaling (crisp on Retina/4K)
· Adaptive grid — major/minor grid lines auto-scale with zoom level
· Square grid, polar grid, or no grid — selectable per view
· Axis tick labels with automatic decimal precision
· Pan by dragging anywhere on the canvas
· Zoom with scroll wheel (zoom-to-cursor) or pinch on touch devices
· Zoom controls — +, −, and reset buttons in the corner
· Window settings panel — type exact xmin, xmax, ymin, ymax
· Radians / degrees toggle for all trigonometric functions
· Key-point detection — automatic root, intercept, vertex, and intersection markers
· Trace on hover — live coordinate readout for every visible curve
· Clickable key points — click any detected point to lock its label on screen
· Print-friendly white background toggle for clean PNG exports

---

Expression Types

Nine distinct expression kinds, each auto-detected:

Type Syntax Example
Explicit y = f(x) y = x^2 - 3
Implicit F(x, y) = 0 x^2 + y^2 = 25
Inequality <, >, <=, >= y > x^2
Polar r = f(θ) r = 2 + 3cos(theta)
Parametric (x(t), y(t)) (cos(t), sin(t))
Piecewise {cond: val, cond: val} {x < 0: -x, x >= 0: x}
Point (a, b) (1, 2)
Function definition f(x) = … f(x) = x^2
Restriction expr {cond} y = x^2 {0 < x < 3}

Implicit relations use a marching-squares algorithm to render any F(x, y) = 0 curve — circles, ellipses, hyperbolas, lemniscates, and sideways parabolas all work.
Inequalities are shaded region-by-region with a solid/dashed/dotted boundary line.

---

Interactive Graph Features

· Drag to pan, scroll to zoom-to-cursor
· Pinch-to-zoom on touch devices
· Hover trace — follows your cursor across every visible curve
· Auto-detected key points with labels:
  · x-intercept (roots)
  · y-intercept
  · minimum / maximum (local extrema)
  · intersection (curve-to-curve)
· Click a dot to lock its coordinate label; click empty space to unlock
· Color popup for each expression — 14-swatch palette
· Line styles — solid, dashed, dotted
· Opacity slider per expression
· Show/hide toggle via the colored dot
· Delete expression with the ✕ button

---

Sliders & Variables

· Auto-generated sliders — typing y = ax^2 + bx + c creates draggable sliders for a, b, and c
· Live value field next to each slider for precise input
· Right-click a slider to customize its minimum, maximum, and step
· Any free variable becomes a slider — y = mx + b, y = A sin(Bx + C), etc.
· Unused sliders auto-removed when the variable disappears from all expressions
· Slider values persist through undo/redo and save/load

---

Scientific Calculator

· Real-time evaluation as you type
· On-screen keypad with sin, cos, tan, √, ln, log, π, e, x², x³, nCr, n!
· Full expression parser — parentheses, implicit multiplication, operator precedence, right-associative exponentiation
· Symbolic d/dx — numeric derivative
· Definite integrals via integral(f, a, b) using Simpson's rule
· Statistics — mean, median, stdev, variance, sum, prod
· Combinatorics — nCr, nPr, fact, !
· Number theory — gcd, lcm, mod, nthroot

---

Algebra Tools

Solve Tab

· Step-by-step equation solver — shows every manipulation with a plain-English reason
  · Linear, quadratic, and higher-degree polynomials (up to quartic)
  · Rational root theorem fallback for degree 3+
  · Complex roots shown when discriminant < 0
  · Exact fractions and simplified radicals
· Quadratic explorer — vertex, vertex form, factored form, discriminant, roots, sum/product of roots
· X-puzzle — find two numbers given their sum and product, with factored form
· System of equations — 2×2 solver via Cramer's rule with unique/infinite/no-solution detection

Factor & Simplify Tab

· Factoring engine with steps:
  · Greatest common factor
  · Difference of squares
  · Perfect-square trinomials
  · Integer trinomials (find-two-numbers)
  · Cubic and quartic via rational roots + synthetic division
· Expand / distribute — polynomial multiplication to standard form
· Complete the square — full step list ending in vertex form
· Rational expression simplifier — factor and cancel with domain restrictions
· Radical simplifier — √72 → 6√2 with factor-tree logic
· Polynomial division — synthetic division with quotient and remainder

Analysis Tab

· Function analyzer
  · Domain (excluded intervals)
  · Sampled range
  · All x-intercepts
  · y-intercept
  · Vertical asymptotes
  · End behavior (y → L as x → ±∞)
· Interval notation converter — bidirectional between inequalities and intervals, including one-sided forms
· Riemann sum visualizer — left, right, midpoint, trapezoid; shaded rectangles on the graph with error vs. exact integral
· Two points & lines — slope, distance, midpoint, slope-intercept equation

Geometry Tab

· Triangle solver — SSS, SAS, ASA, AAS
  · All six sides and angles
  · Heron's formula area
  · Perimeter
· Geometry formulas for 9 shapes:
  · Rectangle, triangle, circle, trapezoid
  · Sphere, cylinder, cone
  · Rectangular prism, square pyramid

Advanced Tab

· Conic classifier — reads A through F from any quadratic, uses B² − 4AC to identify circle/ellipse/parabola/hyperbola, gives center and radius for circles
· Sequence analyzer — arithmetic vs. geometric, recursive and explicit formulas, nth term, partial and infinite sums
· Vertex form converter — y = a(x − h)² + k ⇄ standard form
· Log expander — applies product, quotient, and power rules symbolically

---

Examples Library

A dedicated Examples tab with 14 categories and one-click loading.

Algebra Problems (28 worked examples)

Every example has a Try it button that switches to the Algebra tab, opens the right panel, fills the inputs, and runs the computation automatically.

Graphing Examples

Click Add to append to the current graph, or Replace to clear and load just that example.

Category Count Covers
Explicit Functions 14 Linear, quadratic, cubic, abs, sqrt, cbrt, rational, exp, ln, sin, cos, tan, damped sine, Gaussian
Implicit Relations 5 Circle, ellipse, hyperbola, sideways parabola, lemniscate
Inequalities 6 Half-planes, regions above/below curves, disks, vertical strips, systems
Polar 7 Circle, limaçon, cardioid, 4-petal rose, 3-petal rose, Archimedean spiral, logarithmic spiral
Parametric 5 Unit circle, ellipse, Lissajous, cycloid, spiral
Piecewise 5 Absolute value, step, tent, three-piece, staircase
Sliders 5 Quadratic family, sine family, line family, exponential family, circle radius
User Functions 3 Define/reuse, composition, piecewise function
Calculus 4 Derivative, sine + derivative, integral, area under curve
Points 3 Scatter, points on curve, vertical alignment
Domain Restrictions 3 Limited domain, one period, positive x only
Systems 5 Two lines, parallel, same line, line + parabola, three curves

---

Save / Load / Export

Multi-Slot Save System

· 12 save slots in a grid layout
· Each slot stores: expressions, colors, line styles, opacity, slider values, view window, grid type, and angle mode
· Per-slot actions: Load, Rename, Overwrite, Delete
· Timestamps on every save
· Expression preview shows the first few expressions in each slot
· Auto-overwrite oldest when all slots are full

JSON Export / Import

· Export JSON — downloads the full state as a portable .json file
· Import JSON — restores a saved file across devices or browsers

PNG Export

· ⬇ PNG button downloads the current graph
· Timestamped filenames — graph-2024-01-15-14-30-00.png
· Auto-switches to the graphing tab if you're elsewhere
· Print-friendly white background option
· Retina-aware — exports at device pixel ratio

Undo / Redo

· 60-state history with Ctrl+Z / Ctrl+Y
· Snapshots capture expressions, sliders, view, and settings

---

Keyboard Shortcuts

Shortcut Action
Ctrl+Z / Cmd+Z Undo
Ctrl+Y / Ctrl+Shift+Z Redo
Ctrl+S / Cmd+S Open saves modal
Enter in expression input Commit and add new expression
Right-click a slider Edit min / max / step
Click a key point Lock its coordinate label

---

Supported Syntax Reference

Operators

+ - * / ^ ! ( ) , < > <= >= = !=

Constants

pi, e, tau, phi

Trigonometry

sin, cos, tan, sec, csc, cot
asin, acos, atan, atan2
sinh, cosh, tanh

Exponential / Logarithmic

exp, ln, log (base 10), log2, log10, sqrt, cbrt, nthroot(n, x)

Rounding / Sign

abs, floor, ceil, round, sign, min, max, mod

Combinatorics / Number theory

fact, nCr, nPr, gcd, lcm

Statistics

mean, median, stdev, variance, sum, prod

Calculus

d/dx(expr) — numeric derivative at the current x
integral(expr, a, b) — Simpson's rule

Unicode (auto-converted)

π → pi, θ → theta, √ → sqrt, ≤ → <=, ≥ → >=, ≠ → !=, − → -, × → *, ÷ → /

Implicit Multiplication

2x, 3(x+1), x sin(x), (x+1)(x-2) all parse correctly.

Variable Conventions

· x, y — Cartesian coordinates
· t — parametric parameter
· theta or θ — polar angle
· r — polar radius
· Any other letter — auto-slider

---

Known Limitations

· Complex numbers are not fully supported — sqrt(-1) returns NaN, not i
· Implicit plotting uses a 130×130 marching-squares grid; extremely thin features can look chunky when zoomed in
· Regression (y₁ ~ mx₁ + b) is not implemented — that would need a table/spreadsheet UI
· 3D surfaces are not supported
· Exact symbolic algebra is limited to the algebra tools; the graph engine is numeric
· Degree 3+ equations use rational-root theorem, so irrational roots of high-degree polynomials aren't solved symbolically
· Inequality shading samples a 5-pixel grid, so boundaries near asymptotes may have visible pixel stair-stepping
