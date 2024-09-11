const { volRefused } = require("./email");

module.exports = {
  token: {
    from: {
      email: "no-reply@iera.ca",
      name: "iERA",
    },
    personalizations: [
      {
        to: [
          {
            email: "",
          },
        ],
        dynamic_template_data: {
          code: "",
        },
      },
    ],
    template_id: "d-6d32d4d47a8a415dbe5f293c5247dab5",
  },
  welcome: {
    from: {
      email: "no-reply@iera.ca",
      name: "iERA",
    },
    personalizations: [
      {
        to: [
          {
            email: "",
          },
        ],
        dynamic_template_data: {
          code: "",
        },
      },
    ],
    template_id: "d-e1d2dffb24454f42b467b3ee048fb258",
  },
  newVolunteerAdded: {
    from: {
      email: "no-reply@iera.ca",
      name: "iERA",
    },
    personalizations: [
      {
        to: [
          {
            email: "admin@iera.ca",
          },
          {
            email: "ausman@iera.ca",
          },
          {
            email: "volunteer.manager@iera.ca",
          },
          {
            email: "jeneva.blanco@iera.ca",
          },
          {
            email: "almahmud.ali@iera.ca",
          },
        ],
        dynamic_template_data: {
          first_name: "",
          last_name: "",
          details_name: "",
        },
      },
    ],
    template_id: "d-9361599f84f0458aaa0d90edaac6f70d",
  },
  volApproval: {
    from: {
      email: "no-reply@iera.ca",
      name: "iERA",
    },
    personalizations: [
      {
        to: [
          {
            email: "",
          },
        ],
        dynamic_template_data: {
          code: "",
        },
      },
    ],
    template_id: "d-48720853af6a48cfb179c6c5eb560735",
  },
  volRefused: {
    from: {
      email: "no-reply@iera.ca",
      name: "iERA",
    },
    personalizations: [
      {
        to: [
          {
            email: "",
          },
        ],
        dynamic_template_data: {
          code: "",
        },
      },
    ],
    template_id: "d-99cab121e2fa400f9e06496c1b4a89a2",
  },
  newMuslimAdded: {
    from: {
      email: "no-reply@iera.ca",
      name: "iERA",
    },
    personalizations: [
      {
        to: [
          {
            email: "jeneva.blanco@iera.ca",
          },
        ],
        cc: [
          {
            email: "admin@iera.ca",
          },
          {
            email: "ausman@iera.ca",
          },
          {
            email: "volunteer.manager@iera.ca",
          },
          {
            email: "almahmud.ali@iera.ca",
          },
        ],
        dynamic_template_data: {
          first_name: "Josepth",
          last_name: "John",
          type: "Self Registration",
          phone: "5466666666",
          email: "email@newmuslim.com",
          who: "Al-Mahmud Ali (volunteer)",
        },
      },
    ],
    template_id: "d-bca8f89f9a6f47d4a8ce57cb249c0287",
  },
};
