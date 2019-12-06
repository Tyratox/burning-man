# Burning man – Simulating the behaviour of people in the event of fire
> * Group Name: Fire Brigade
> * Group participants names: Nico Hauser, Andri Horat, Elias Schmid, Jonas Spieler
> * Project Title: Burning Man

## Information

* An working online version of the simulation can be found at https://tyratox.github.io/burning-man/
* The newest version of the report can be found at https://github.com/Tyratox/burning-man/raw/master/doc/latex/report.pdf, the decleration of originality at https://github.com/Tyratox/burning-man/raw/master/doc/latex/declaration-originality.pdf.
* The presentation is available at https://github.com/Tyratox/burning-man/presentation/

## General Introduction

This paper describes a model for the behaviour of people in the event of fire and it's simulation. The model tries to incorporate the general repulsion of people standing too close, the formation of groups in panic situations, the placement of exit signs and many other factors such as different speeds. In order to make observations on the defined model, it is simulated using a physics engine using javascript that makes it accessible from any place at any time and allows for reproducible and verifiable results. The paper defines a general parameterized model of the environment and the agents which, with the right choice of simulation parameters, even allow for a safety evaluation of specific settings. Simulations using this model were able to verify results of other papers but also put them into perspective.

The goal was to create a tool, that enables the simulation of people's behaviour in an event of fire in a given environment. Using this simulation, we can for example

* detect Bottlenecks in terms of space, e.g. door width
* test if there are enough exit signs
* observe how the desired speed of the agents relates to the time it takes until all agents are rescued.

## The Model

### Environment model

Before agents can react to a fire an environment has to be created which in our case is a building but is in general not restricted to buildings and could thus also be applied to other settings such as a festival. As the environment is one of the parameters that in a successful model should be easy to change, a subset of a pre-existing format definition is used. The environment consists of the so-called object layers `signs`, `agents`, `doors`, `physical-walls`, `navmesh` and `despawn-zones`. The `signs` and `doors` layers contain points indicating the position of the safety signs and the doors. They are separate as they represent different things. The safety signs represent actual signs that the agents follow should they be visible. The location of the doors on the other hand are remembered by the agents and thus do not have to be visible for the agent to know it's location. In addition both signs can have the two properties `orientationX` and `orientationY` indicating the direction of a `180` degree angle from which the sign is visible. Another property signs can have is `radius` which, if defined, overrides the default radius for marking a sign as visited. The reasons will be made clear in the description of the agent model. The `agents` layer also consists of points indicating the spawn points of the agents. `physical-walls`, as the name might suggest, defines the location of the walls using rectangles. This layer is used for giving the environment a shape as the agents cannot walk through these walls. In addition this layer is used for the raytracing algorithm as the agents should not be able to see signs if there's a wall in between but more to that in the agent model description. The `navmesh` layer defines the navigation mesh mode of rectangles. This mesh defines the points an agent can use for navigation when walking into the direction of a sign or a door. The details of this navigation mesh are also described in the next section about the agent model. Last but not least there's the `despawn-zones` layer where rectangles are used to define areas that will, when colliding with an agent, remove it from the simulation and count them as in safety.

### Agent model
For the agent model a so-called social force model is used. In short agents behave like particles in newtonian physics. Every agent has a mass, position and velocity and on every agent act a bunch of forces resulting in an acceleration according to the famous `F=m*a`. The agents representing the people are approximated as a circle in the physics engine where each agent has different intrinsic properties, most of which are generated randomly based on a normal distribution with selected mean and standard deviation values. To have more realistic values we cap the random distribution within the standard deviation as the actual probability of some value far away would otherwise not be zero, just very small.

First we calculate the basic properties `weight, fitness` and `age` based on the described capped normal distribution. The radius or size of the agent is then also chosen from the capped normal distribution but is then also multiplied with the *normalized* `weight` and divided by the *normalized* `fitness`. By *normalized* we refer to the proportion of the random value to the mean for the given value. This factor `1/agility = |weight|/|fitness|` (the modulus `|  |` refers to the *normalized* value) or rather its inverse is also used when generating the `maxVelocity` and the `maxAcceleration`, both of these values are multiplied with this factor `agility` after being randomly chosen from the respective capped normal distribution. As visual sight is a very important in emergency situations for finding safety signs and can also be distributed by for example smoke, the property `visualRange` is also generated from another capped normal distribution whose result is then divided by the *normalized* age.

After the generation of these random values, the agents are a sole product of their environment and their behaviour is based on a set of simple rules.

* Wall repulsion
    
	To model human behaviour, agents should in general prefer to move away from walls as most humans prefer to have some space around them.

* Agent repulsion
    
    For the same reason people do not like to stand close to each other, especially not in emergency situations. To model this, the agents will thus move away from each other if their distance is small.

* Agent attraction
    
    Even tough people do not like to stand close to each other, they still tend to form groups and do not like to act on their own. Thus the agents are instructed to move closer together as long as the distance between them is in the acceptable range.

* Target attraction
    
    Last but definitely not least, the agents have to do something and not just stand around. In the best case, the agents should try to reach one of the defined escape zones. In real life, safety signs guide people to these safe zones so the agents are instructed to always be on the lookout for visible signs guiding them to safety. In real life not all small rooms do have safety signs in them as for humans the only viable option in an emergency is to first leave the room they're in. As the agents should follow this behaviour, doors function similar to signs except that they do not have to be visible. This allows to simulate some kind of memory of the agents and enables them to leave the room even without have seen a safety sign. Another type of memory that is simulated is the remembrance of already visited signs and doors as real humans will not follow the same sign twice if the direction the sign points in didn't lead to an exit the first time around. An exception is made to this, when an agent doesn't have any target anymore they "forget" everything they visited before and start from scratch. This allows for some more complex behaviours such as an agent being pushed back into the room he just was in because of other agents rushing the hallway. If the memory wasn't cleared, the agent now wouldn't leave the room a second time which of course would be a real bad behaviour.

## Fundamental Questions

1. What is the relation between the desired speed of the individuals and the time it takes until all agents are rescued. More specifically: Is there an optimal desired speed, that leads to the fastest rescue of all agents.
2. What is the impact of the door width and hallway width on the evacuationtime?

## Expected Results

1. Expected result: There is an optimal speed, such that the rescue time is worse for both a lower speed and a higher speed.
2. Expected result: The more space the people have the better.

## References 

[1] Richard Davey. Phaser. https://github.com/photonstorm/phaser, last visited on 2019-12-01.

[2] Dirk Helbing, Illés Farkas, and Tamás Vicsek. Simulating dynamic features of escape panic. Nature, 407:487–490, 09 2000.

[3] Thorbjrn Lindeijer. Tiled. https://github.com/bjorn/tiled, last visited on 2019-12-01.

## Research Methods

- Agent based social force model

## Reproducibility

In order to reproduce some of our results, open https://tyratox.github.io/burning-man/ in your browser.

If you want to modify the code, then follow the instructions below:

### Setup

If Node.js is not already installed on your computer, start by installing it from https://nodejs.org/en/download/.

Now you can either download the codebase manually from github or directly use the command line. If you download it manually, unzip it and open a shell in the parent directory. Then start from the second point.
* `git clone https://github.com/Tyratox/burning-man.git` - Download the code
* `cd burning-man/code` - Navigate to the code
* `npm install` - Install all dependencies
* `npm start` - Start a local development server that will automatically open the browser and refresh it when making changes to the code
