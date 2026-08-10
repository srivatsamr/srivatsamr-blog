// get the ninja-keys element
const ninja = document.querySelector('ninja-keys');

// add the home and posts menu items
ninja.data = [{
    id: "nav-about",
    title: "About",
    section: "Navigation",
    handler: () => {
      window.location.href = "/";
    },
  },{id: "nav-blog",
          title: "Blog",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/blog/";
          },
        },{id: "nav-cv",
          title: "CV",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/cv/";
          },
        },{id: "post-learning-linear-and-independent-structures-a-guided-journey",
        
          title: "Learning Linear and Independent Structures — A Guided Journey",
        
        description: "A conversational record of working through Chapter 2 of the Berkeley Deep Representation Learning book — PCA, Dictionary Learning, and the mathematics behind them.",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2026/PCAandDictionaryLearning/";
          
        },
      },{id: "post-consistency-beats-short-sprints-over-a-long-run",
        
          title: "Consistency beats short sprints over a long run",
        
        description: "An entry to remind my future self that planning and consistency beats over-enthusiastic sprints",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2026/ConsistencyBeatsSprint/";
          
        },
      },{id: "post-building-a-transformer",
        
          title: "Building a Transformer",
        
        description: "A visual summary and important notes",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2026/BuildingATransformer/";
          
        },
      },{id: "post-kriging-and-simulation-in-geostatistics",
        
          title: "Kriging and Simulation in Geostatistics",
        
        description: "A mathematical derivation",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2026/GaussianSimulation/";
          
        },
      },{id: "post-expectation-maximization-algorithm",
        
          title: "Expectation Maximization Algorithm",
        
        description: "Intuitive derivation",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2026/ExpectationMaximization/";
          
        },
      },{id: "post-setting-up-project-in-vs-code-for-c-cuda-development",
        
          title: "Setting up project in VS Code for C++ CUDA development",
        
        description: "Dependencies, directory structure, extensions and sample program",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2026/CppCUDAProjectStructure/";
          
        },
      },{
        id: 'social-cv',
        title: 'CV',
        section: 'Socials',
        handler: () => {
          window.open("/assets/pdf/SrivatsaMR_CV.pdf", "_blank");
        },
      },{
        id: 'social-instagram',
        title: 'Instagram',
        section: 'Socials',
        handler: () => {
          window.open("https://instagram.com/_measheartist_", "_blank");
        },
      },{
        id: 'social-linkedin',
        title: 'LinkedIn',
        section: 'Socials',
        handler: () => {
          window.open("https://www.linkedin.com/in/srivatsa-mr", "_blank");
        },
      },{
        id: 'social-rss',
        title: 'RSS Feed',
        section: 'Socials',
        handler: () => {
          window.open("/feed.xml", "_blank");
        },
      },{
      id: 'light-theme',
      title: 'Change theme to light',
      description: 'Change the theme of the site to Light',
      section: 'Theme',
      handler: () => {
        setThemeSetting("light");
      },
    },
    {
      id: 'dark-theme',
      title: 'Change theme to dark',
      description: 'Change the theme of the site to Dark',
      section: 'Theme',
      handler: () => {
        setThemeSetting("dark");
      },
    },
    {
      id: 'system-theme',
      title: 'Use system default theme',
      description: 'Change the theme of the site to System Default',
      section: 'Theme',
      handler: () => {
        setThemeSetting("system");
      },
    },];
