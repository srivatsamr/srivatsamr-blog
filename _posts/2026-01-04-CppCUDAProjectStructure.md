---
layout: post
title: Setting up project in VS Code for C++ CUDA development
date: 2026-01-04
description: Dependencies, directory structure, extensions and sample program
categories: dev c++
---

# GPUs and CUDA programming

Everyone either wants, needs or has GPUs now. My workplace has already acquired several powerful NVIDIA GPUs and plans to expand the capacity further. While most of the demand for GPUs in the industry is for machine learning applications, a small fraction of the demand is also coming from the scientific computing community, especially in high-performance computing centres, as they add significantly to the compute capacity of the centre. With GPUs almost everywhere around me, as a computational scientist, I need to understand them better than just using high-level frameworks. And my work involves more than just machine learning. So I decided to go beyond PyTorch or TensorFlow and delve deeper into GPU programming, understanding its architecture, programming patterns, and code optimisation. I am about to complete a GPU specialisation course on Coursera (I will review once I am done), and it’s time for me to set up a project structure to use as a template for any C++ CUDA projects.

# The Development Environment

Here is the bash script to setup the development environment on Ubuntu (assuming the NVIDIA drivers are already installed)
```
#!/bin/bash

# Update system
sudo apt update && sudo apt upgrade -y

# Install build essentials
sudo apt -y install build-essential

# Download the specific keyring for Ubuntu 24.04
wget https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2404/x86_64/cuda-keyring_1.1-1_all.deb

# Install the keyring
sudo dpkg -i cuda-keyring_1.1-1_all.deb

# Update your local repository cache
sudo apt-get update

sudo apt-get -y install cuda-toolkit
```

Then add the following to your `~/.bashrc`:
```
export PATH=/usr/local/cuda/bin${PATH:+:${PATH}}
export LD_LIBRARY_PATH=/usr/local/cuda/lib64${LD_LIBRARY_PATH:+:${LD_LIBRARY_PATH}}
```

Either source `~/.bashrc` or open a new terminal to verify installation with:
* `nvidia-smi`
* `nvcc --version`
* `cuda-gdb --version`

## VS Code setup

Install the following extensions:
* [C++ Extension Pack](https://marketplace.visualstudio.com/items?itemName=ms-vscode.cpptools-extension-pack)
* [Nsight Visual Studio Code Edition](https://marketplace.visualstudio.com/items?itemName=NVIDIA.nsight-vscode-edition)

# The Project Structure

After some trial and error, I ended up setting up my project as follows (toy example):

```
├── CHANGELOG.md
├── CMakeLists.txt
├── LICENSE.txt
├── README.md
├── data
├── include
│   └── dAdd.hpp
├── src
│   ├── CMakeLists.txt
│   ├── api
│   │   └── dAdd.cu
│   └── kernels
│       ├── add.cu
│       └── add.hpp
└── test
    ├── CMakeLists.txt
    └── test_kernel.cpp
```

The structure needs some explanation:

* A C++ CUDA code consists of kernels which are the parallel parts of the code that each thread in the GPU executes.
* These kernels are called by the host side functions

When compiling a C++ code, the header files are literal insertions of code snippets into the file that includes them, and the src files are used to create the build objects. All CUDA source files must have `.cu`extension. If not, plain `.cpp`files are compiled by `CXX`compiler which will fail when it encounters code sections with things like `__global__`, `<<<>>>`, and other CUDA specific syntax. In my current structure, I separate the kernels from the API. Kernels are called by functions in the API which are exposed to the user of the library. 

The tests are linked to my developed library and it can be just `.cpp`files as tests don't have any CUDA syntax (the header of the library API doesn't have any CUDA code. To achieve this, its important to note that all the headers needed for implementation must be included in the cpp file and not header file). They instead use the host API to delegate work to the GPU.

# CMakeLists templates

## root:
```
cmake_minimum_required(VERSION 3.20)
project(SSALib LANGUAGES CXX CUDA)

set(CMAKE_BUILD_TYPE Debug CACHE STRING "" FORCE)
if (CMAKE_BUILD_TYPE STREQUAL "Debug")
    set(CUDA_NVCC_FLAGS "-g -G")
endif()

# -----------------------------
# Build the library
# -----------------------------
add_subdirectory(src)

# -----------------------------
# Optional testing
# -----------------------------
include(CTest)
if(BUILD_TESTING)
    add_subdirectory(test)
endif()

# -----------------------------
# Package config/version (for find_package)
# -----------------------------
include(CMakePackageConfigHelpers)

# Version file
write_basic_package_version_file(
    "${CMAKE_CURRENT_BINARY_DIR}/SSALibConfigVersion.cmake"
    VERSION 0.1.0
    COMPATIBILITY AnyNewerVersion
)

# Install top-level config file
install(FILES
    "${CMAKE_CURRENT_BINARY_DIR}/SSALibConfigVersion.cmake"
    DESTINATION lib/cmake/SSALib
)
```

## src:
```
# -----------------------------
# Collect source files automatically
# -----------------------------
# Host-side implementation
file(GLOB_RECURSE HOST_SOURCES
    CONFIGURE_DEPENDS
    api/*.cu
)

# CUDA kernels
file(GLOB_RECURSE KERNEL_SOURCES
    CONFIGURE_DEPENDS
    kernels/*.cu
)

set(LIB_SOURCES
    ${HOST_SOURCES}
    ${KERNEL_SOURCES}
)

# -----------------------------
# Create library
# -----------------------------
add_library(ssalib STATIC ${LIB_SOURCES})

target_compile_features(ssalib PUBLIC cxx_std_17)

if (${CMAKE_BUILD_TYPE} STREQUAL "Debug")
    message(STATUS "Building ssalib in Debug mode")
    target_compile_options(ssalib
        PRIVATE
            $<$<AND:$<CONFIG:Debug>,$<COMPILE_LANGUAGE:CUDA>>: -g -G -O0>
            $<$<AND:$<CONFIG:Debug>,$<COMPILE_LANGUAGE:CXX>>: -g -O0>
    )
else()
    message(STATUS "Building ssalib in Release mode")
endif()

# Enable CUDA separable compilation for kernels
set_target_properties(ssalib PROPERTIES
    CUDA_SEPARABLE_COMPILATION ON
    POSITION_INDEPENDENT_CODE ON
)

# Include directories
target_include_directories(ssalib
    PUBLIC
        $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/../include>
        $<INSTALL_INTERFACE:include>
    PRIVATE
        ${CMAKE_CURRENT_SOURCE_DIR}   # api/ and kernels/ for internal compilation
)

# -----------------------------
# Install library and headers
# -----------------------------
install(TARGETS ssalib
    EXPORT ssalibTargets
    ARCHIVE DESTINATION lib
    LIBRARY DESTINATION lib
    RUNTIME DESTINATION bin
    INCLUDES DESTINATION include
)

# Install public headers
install(DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR}/../include/
    DESTINATION include
)

# Export targets for find_package
install(EXPORT ssalibTargets
    FILE ssalibTargets.cmake
    NAMESPACE ssalib::
    DESTINATION lib/cmake/ssalib
)

```

## test
```
Include(FetchContent)

FetchContent_Declare(
  Catch2
  GIT_REPOSITORY https://github.com/catchorg/Catch2.git
  GIT_TAG        v3.8.1 # or a later release
)

FetchContent_MakeAvailable(Catch2)

# Automatically pick up all test cpp files
file(GLOB_RECURSE TEST_SOURCES
    CONFIGURE_DEPENDS
    *.cpp
)

add_executable(tests ${TEST_SOURCES})

if (${CMAKE_BUILD_TYPE} STREQUAL "Debug")
    message(STATUS "Building tests in Debug mode")
    target_compile_options(tests
        PRIVATE
            $<$<AND:$<CONFIG:Debug>,$<COMPILE_LANGUAGE:CXX>>:-g -O0>
    )
else()
    message(STATUS "Building tests in Release mode")
endif()


target_link_libraries(tests
    PRIVATE
        ssalib
        Catch2::Catch2WithMain
)

include(Catch)
catch_discover_tests(tests)
```

## Notes:
* Organising CUDA code into multiple files is good for maintainability and extensibility. But to compile them, we need to use `CUDA_SEPARABLE_COMPILATION` and `POSITION_INDEPENDENT_CODE`. 
* `CUDA_SEPARABLE_COMPILATION` allows code units in one `.cu` files to call functions from other `.cu` files. But this comes with some overhead. Particularly, extra registers get used when separable compilation is used. If we really care about performance, we should put all the code that is required by a `.cu` locally. Since perrformance is the primary objective, NVIDIA has made it an option instead of making it the default behavior
* For debugging, CUDA code requies `-G` flag. So add both `-g` and `-G` to debug host and device code

# Setting up debugger for CUDA in VS Code

The Nsight Visual Studio Code Edition extension provides the necessary interface to debug CUDA code. We need to create a launch configuration to enable this debugging. See [this](https://docs.nvidia.com/nsight-visual-studio-code-edition/latest/cuda-debugger/index.html). I have a launch configuration as follows:

```json
{
    "version": "0.2.0",
    "configurations": [
        
        {
            "name": "CUDA C++: Launch",
            "type": "cuda-gdb",
            "request": "launch",
            "program": "${command:cmake.launchTargetPath}",
            "cwd": "${workspaceFolder}",
            "stopAtEntry": false
        },
        {
            "name": "CUDA C++: Attach",
            "type": "cuda-gdb",
            "request": "attach"
        }
    ]
}
```

You can then set break points in the editor and start debugging. 

## Note:
When using CMakeTools extension, we get build and debug tool icons in the bottom bar of VS Code. That debug doesn't launch CUDA debugger. Instead, use the `Select and Start Debug Configuration`

{% include figure.liquid 
    path="assets/img/post/2026-01-04_1.jpg" 
    class="img-fluid rounded z-depth-1" 
    title="VS Code CUDA debugging" 
    caption="Launch CUDA debugger using the launch configuration" 
%}

We can then step through the code as usual. The difference between CUDA debugger and regular debugger is that it allows us to set focus on a particular thread when we are within the kernel. This is an incredibly useful feature. See the image below:

{% include figure.liquid 
    path="assets/img/post/2026-01-04_2.png" 
    class="img-fluid rounded z-depth-1" 
    title="Changing the focus to a particular thread" 
    caption="CUDA debugger focus" 
%}

# Done!

With this, we have a basic project setup. I hope to experiment with profiling the CUDA code in my project and documenting it here sometime. 
