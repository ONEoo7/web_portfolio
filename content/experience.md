---
title: Experience
---

## Software Engineer — Yazaki Component Technology Timisoara (2022 – present)
# AI Research & Development
**Client**:
 - Yazaki

**Responsibilities**:
 - System Architecture, Development, Integration, Testing

**Target**:
 - Cross-platform (windows, linux, macos) software stack

**Scope**:
 - Evaluate AI use cases and determine where it can improve employees workflow
 - Requirements Engineering Assistant based on ASPICE v4

**Technologies**:
 - Javascript, Typescript, Python, Enterprise Architect, Claude Desktop, Electron, Copilotkit, React, CrewAI, Qdrant, Langfuse, RAGFlow, LiteLLM Proxy Server, neo4j, Docling,
 Ollama, LM Studio, Open WebUI, AnythingLLM, Lemonade Server    

**Major Challenges**:
 - Basic RAG systems are inaccurate, developed solution to tackle this issue
 - Minimize token usage while maximizing percentage of relevant context that the LLM processes

# Door Control Module (xDM)
**Client**:
 - Volvo

**Responsibilities**:
 - Architecture, Development, Integration, Testing

**Target**:
 - Vector MCROSAR (classic AUTOSAR)

**Scope**:
 - Cryptography, Calibration, Operating System resource management

**Technologies**:
 - C, Python, WinIDEA, iSystem iC5700 debugger, Oscilloscope, multimeter and logic analyzer measurements, Vector CANoe, RobotFramework, git, Gitlab, Enterprise Architect,
 Vector Davinci Developer/Configurator  

**Major Challenges**:
 - Solving system resets without TRACE unit inside the microcontroller
 - Implementing simulation solution using CAPL under Vector CANoe for Encrypted CAN Communication concept

# On Board Charger (OBC)
**Client**:
 - Stellantis

**Responsibilities**:
 - Architecture, Development, Integration, Testing

**Target**:
 - Vector MCROSAR (classic AUTOSAR)

**Scope**:
 - Cryptography, PLC (power line communication), V2L (vehicle to load), TCP/IP with TLS

**Technologies**:
 - C/Assembly, Python, Batch, WinIDEA, iSystem iC5700 debugger, Oscilloscope and Multimeter measurements, Vector VT7970 (PLC), RobotFramework, Vector CANoe,
 Windchill RV&S, git, Gitlab, Enterprise Architect, Vector Davinci Developer/Configurator  

**Standards**:
 - ISO 15118 (Road Vehicles — Vehicle to Grid Communication Interface)
 - DIN SPEC 70121 (ISO 15118 predecessor)

**Major Challenges**: 
 - V2L prototype hardware was in house made by stellantis and was buggy
 - Bringup of ethernet communication via PLC

## Software Engineer — Continental Automotive (2013 – 2022)

# Telematics
**Client**:
 - Stellantis

**Responsibilities**:
 - Architecture, Development, Integration, Testing

**Target**:
 - Embedded Linux

**Scope**:
 - Application framework for Continental and Stellantis applications install/update and runtime

**Technologies**: 
 - C/C++, Eclipse C/C++ IDE, git, Gerrit, IBM Rhapsody, Jira, make, Vector CANoe, ATP (automated test platform), bitbake, yocto, bash, python, systemd  

**Major Challenges**: 
 - Open source code maintenance, bug fixing and feature updates

# Infotainment - In-Car Communication (ICC)
**Client**:
 - Continental platform

**Responsibilities**:
 - Architecture, Development, Integration, Testing

**Target**:
 - FreeRTOS based  

**Scope**:
 - Use microphones placed throughout the vehicle to allow any passenger to communicate with driver or their own call

**Technologies**: 
 - C/C++, Eclipse C/C++ IDE, git, Gerrit, IBM Rhapsody, Jira, make, Vector CANoe, bash, python

**Standards**:
 - AVB (audio-video bridging), later it was renamed to TSN (time sensitive networking)
 - IEEE 802.1AS — timing and synchronization (gPTP)
 - IEEE 802.1Qav — traffic shaping (credit-based shaper)
 - IEEE 802.1Qat — stream reservation protocol (SRP)
 - IEEE 1722 - audio-video transport protocol (AVTP)
 - IEEE 100BASE-T1 - Single unshielded twisted pair, designed for the automotive environment (vibration, temperature, EMI tolerance).

**Major Challenges**: 
 - Measuring sound rountrip latency and coming up with solutions to reduce it 
 - Clock synchronization between multiple nodes in the network 

# Infotainment - Software Defined Audio (SDA)
**Client**:
 - Continental platform

**Responsibilities**:
 - Architecture, Development, Integration, Testing

**Target**:
 - Embedded linux (RT Patched), Android  

**Scope**: 
 - Move sound processing instructions from hardware DSP to general purpose CPUs (ex: ARM Cortex A9)  

**Technologies**: 
 - C/C++, SVM (siemens vdo makefiles), Eclipse C/C++ IDE, gdb, IBM CM Synergy, IBM Rhapsody, 
IBM Change Synergy, bitbake, open embedded, klocwork, cmake, make, pkgconfig, bash, python, java  

**Standards**:
 - IEEE 754 (how computers represent and handle floating point numbers)

**Major Challenges**: 
 - Measuring system latency and coming up with solutions to reduce it  
 - Creating own Android SDK that used QEMU as development target
 - Bringup development boards