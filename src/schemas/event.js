db.form_templates.updateOne(
  { _id: "event" },
  {
    $set: {
      form: [
        {
          type: "text",
          label: "Event Name",
          name: "name",
          required: true,
        },
        {
          type: "text",
          label: "Event Description",
          name: "description",
          required: true,
        },
        {
          type: "city_auto",
          label: "City, Province",
          name: "city",
          required: true,
        },
        {
          type: "number",
          label: "Minimum Participants",
          name: "min_participants",
          required: true,
        },
        {
          type: "select",
          label: "Event Type",
          name: "event_type",
          required: true,
          options: [
            {
              label: "Recurring",
              value: "recurring",
            },
            {
              label: "Single",
              value: "single",
            },
          ],
        },
        {
          type: "checkbox",
          label: "For everyone",
          name: "public",
        },
        {
          type: "number",
          label: "Number of Active Events",
          name: "active_events",
          required: true,
          condition: { name: "event_type", value: "recurring" },
        },
        {
          type: "datetime",
          label: "Start date & time",
          name: "start",
          required: true,
        },
        {
          type: "number",
          label: "Length of Event in hours",
          name: "event_length",
          required: true,
        },
        {
          type: "select",
          label: "How Frequently",
          name: "recurring",
          required: true,
          condition: { name: "event_type", value: "recurring" },
          options: [
            {
              label: "Weekly",
              value: "weekly",
            },
            {
              label: "Monthly",
              value: "monthly",
            },
            {
              label: "Yearly",
              value: "yearly",
            },
          ],
        },
        {
          type: "select",
          label: "Status",
          name: "status",
          required: true,
          options: [
            {
              label: "Active",
              value: "active",
            },
            {
              label: "In Active",
              value: "inactive",
            },
          ],
        },
      ],
    },
  }
);
