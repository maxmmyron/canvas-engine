# SLCE
###### (pronounced "slice")
### a **s**weet **l**ittle **c**anvas **e**ngine created by mmyron

## What is SLCE?
SLCE is a pure-javascript canvas engine. It was formed with a few basic principles in mind:
- [Organization](#organization)
- [Iteration](#iteration)
- [Stability](#stability)
- [Accessibility](#accessibility)

It is one thing to tell you that SLCE is built on these priciples, but how do they play into SLCE itself? 
### Organization
### Iteration
### Stability
### Accessibility

## How do I use SLCE?
However you'd like, really. SLCE is meant to be a capable engine that is versatile enough to use in multiple application.

## What is currently in SLCE?
Well, admittedly... not much. Here is a semi-complete list of the features available in SLCE as of the current version:
- Objects
  - Convex Objects
  - Circles
  - Surface Planes
- Elementary Physics
  - Gravity
    - nBody gravity simulations
  - Basic Air Resistance (Currently limited to Circles)
  - Object Collision Detection
  - Object Collision Reponse

So, what is upcoming? Well, I'm glad I asked.
Here is a small list of what is to come in future iterations of SLCE:
- Objects
  -Concave Objects
  -Mutable objects (objects with unique parameters that can be changed. Springs, balloons, etc.)
- Collision Detection
  - SAT for convex objects
  - Advanced SAT for concave objects (i.e. splitting concave objects into multiple connected convex objects)
  - Simple distance-based collision detection for Circles
- Advanced Collision Response
- Phsyics
  - Proper tension calculations (objects being held by ropes, etc.)
  - "Fluids"
  - More correct portyal of forces (Able to display various net forces on a moving object)
  - Proper destruction simulations (Think those KEVA planks destruction simulations)