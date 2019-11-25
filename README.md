# Burning man 🔥💀 – Simulating the behaviour of people in the event of fire

> * Group Name: Fire Brigade
> * Group participants names: Nico Hauser, Andri Horat, Elias Schmid, Jonas Spieler
> * Project Title: Burning Man 🔥💀

## General Introduction

(States your motivation clearly: why is it important / interesting to solve this problem?)
(Add real-world examples, if any)
(Put the problem into a historical context, from what does it originate? Are there already some proposed solutions?)

Our goal is to create a tool, that enables us to simulate how people behave in an event of fire in a given building. Using this simulation, we could
1.) detect Bottlenecks in terms of space, e.g. door width
2.) test if there are enough exit signs
3.) observe how the desired speed of the agents relates to the time it takes until all agents are rescued.

Real-world application:
We could use this tool to test a stadium and other public areas as a preparation for a big event where several thousand individuals attend. Using this tool (or using a more efficient implementation of it) we might be able to detect bottlenecks regarding emercency exists beforehand. This enables us to optimize the infrastructure and potentially save lifes.

## The Model

(Define dependent and independent variables you want to study. Say how you want to measure them.) (Why is your model a good abtraction of the problem you want to study?) (Are you capturing all the relevant aspects of the problem?)

We use the so-called social force model. The model consists of agents, that behave like particles in Newtonian Physics. Every agent has a mass, position and velocity and on every agent act a bunch of forces. The forces are : (1) exponential repulsion from each other and from the walls. (2)  the force that the agents apply to accelerate to the velocity they want.

## Fundamental Questions

(At the end of the project you want to find the answer to these questions)
(Formulate a few, clear questions. Articulate them in sub-questions, from the more general to the more specific. )

1.) What is the relation between the desired speed of the individuals and the time it takes until all agents are rescued. More specifically: Is there an optimal desired speed, that leads to the fastest rescue of all agents.
2.) Does it improve the rescue time if the agents tend to stay together?

## Expected Results

(What are the answers to the above questions that you expect to find before starting your research?)

1.) Expected result: There is an optimal speed, such that the rescue time is worse for both a lower speed and a higher speed.
2.) Expected result: The group is much slower if the agents want to be close to each other.

## References 

(Add the bibliographic references you intend to use)
(Explain possible extension to the above models)
(Code / Projects Reports of the previous year)

Dirk Helbing, Illés Farkas, and Tamás Vicsek:
Simulating dynamical features of escape panic
Nature 407, 487-490 (2000)

Wang, Peng. (2016). Understanding Social-Force Model in Psychological Principles of Collective Behavior. 

## Research Methods

(Cellular Automata, Agent-Based Model, Continuous Modeling...) (If you are not sure here: 1. Consult your colleagues, 2. ask the teachers, 3. remember that you can change it afterwards)

Social force model

## Other

(mention datasets you are going to use)
