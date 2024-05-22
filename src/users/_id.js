const emails = [
  "app.admin@iera.ca",
  "app.volunteer@iera.ca",
  "app.newmuslim@iera.ca",
  "ext.org.contact@iera.ca",
  "app.mentor@iera.ca",
];
const { v4: uuidv4, v5: uuidv5 } = require("uuid");
for (let email of emails) {
  console.log(email, uuidv5(email, uuidv5.URL));
}


{
	"_id" : "f2a9171f-14e0-58f8-a80f-917880e6cbc",
	"type" : null,
	"email" : "app.newmuslim@iera.ca",
	"password" : "d933b0f6-bebc-5678-a641-806f4c992547",
	"benefit_from_iera" : "no",
	"birth_year" : "1974",
	"confirmation_of_understanding" : true,
	"criminal_convictions" : "no",
	"dawah_training" : "yes_iera",
	"experience" : true,
	"first_name" : "APP.NewMuslim",
	"gender" : "male",
	"groups" : [ "volunteer" ],
	"ids" : {
		"7c5d3d03-f24a-47b5-9a95-df730fff60ce" : {
			"_id" : "7c5d3d03-f24a-47b5-9a95-df730fff60ce",
			"filename" : "Tralor pic.jpeg",
			"size" : 3580007,
			"mime" : "image/jpeg",
			"ETag" : "\"8a5e72fb3badcb88a2a244d3fbf9f11a\"",
			"VersionId" : "7e70c8e2a30d6d17293022e4350e03b7",
			"key" : "30f939dd-335e-5e2e-8487-eeb99feaa676/ids/7c5d3d03-f24a-47b5-9a95-df730fff60ce"
		}
	},
	"iera_mission" : "n/a",
	"iera_why" : "n/a",
	"islamic_education" : "yes",
	"islamic_education_institute" : "n/a",
	"last_name" : "@iera.ca",
	"offered_gifts" : "no",
	"other_conflicts" : "no",
	"position" : "new_muslim_mentor",
	"postal_code" : "l5n1a1",
	"skills" : "Fundraising",
	"social" : "n/a",
	"status" : "approved",
	"volunteer_hours" : "2-4",
	"sub_groups" : [ "mentor" ]
}