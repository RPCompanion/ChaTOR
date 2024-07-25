export default `{
    // (Required) The name of the ruleset
    name: "Standard",

    // Must be three numbers, each with a value of 255 or less
    version: [1, 0, 0],

    // (Required)
    description: "The standard rules for SWTOR character sheets",

    // The base stats for a character
    base_health: 10,
    base_armor_class: 7,

    /*
    
        attributes (required)
        skills (optional)
        perks (optional)

        given_points (required) specifies the number of points a character starts with in that category
        max_points_per_allotment (optional) specifies the maximum number of points a character can allot to a single element in that category

    */
    allotments: {
        attributes: {
            given_points: 15,
            max_points_per_allotment: 5
        },
        skills: {
            given_points: 20,
            max_points_per_allotment: 10
        },
        perks: {
            given_points: 3
        }
    },

    /*
        pub struct Perk {
            pub name: String,
            pub description: String,
            pub point_cost: i32,
            pub attributes: Option<Vec<AttributeModifier>>,
            pub skills: Option<Vec<SkillModifier>>
        }

        pub struct AttributeModifier {
            pub name: String,
            pub modifier: i32,
        }

        pub struct SkillModifier {
            pub name: String,
            pub modifier: i32,
        }
    */
    perks: [
        {
            name: "Force Sensitive",
            description: "Unlocks the ability to use the Force",
            point_cost: 2
        },
        {
            name: "Small Frame",
            description: "You are smaller than average, giving you a bonus to Agility but a penalty to Strength",
            point_cost: 1,
            attributes: [
                {
                    name: "Strength",
                    modifier: -3
                },
                {
                    name: "Agility",
                    modifier: 2
                }
            ]
        },
        {
            name: "Honest Face",
            description: "You have a trustworthy face, giving you a penalty to Deception",
            point_cost: -1,
            skills: [
                {
                    name: "Deception",
                    modifier: -4
                }
            ]
        }
    ],

    /* The list of weapons a character can be proficient in 
        pub struct WeaponProficiency {
            pub categories: Vec<WeaponCategory>
        }

        pub struct WeaponCategory {
            pub category: String,
            pub weapons: Vec<Weapon>
        }

        pub struct Weapon {
            pub weapon: String,
            pub required: Option<Requirements>
        }

        pub struct Requirements {
            pub perks: Option<Vec<String>>
        }
    */
    weapon_proficiences: {
        categories: [
            {
                category: "Ranged",
                weapons: [
                    {
                        weapon: "Pistol"
                    },
                    {
                        weapon: "Rifle"
                    }
                ]
            },
            {
                category: "Melee",
                weapons: [
                    {
                        weapon: "Unarmed"
                    },
                    {
                        weapon: "Sword"
                    },
                    {
                        weapon: "Dagger"
                    },
                    {
                        weapon: "Lightsaber",
                        required: {
                            perks: ["Force Sensitive"]
                        }
                    }
                ]
            },
            {
                category: "Explosives",
                weapons: [
                    {
                        weapon: "Grenade"
                    },
                    {
                        weapon: "Charge"
                    },
                    {
                        weapon: "Cannon"
                    }
                ]
            }
        ]
    },


    /* The list of attributes that a character can have

        pub struct Attribute {
            pub name: String,
            pub description: String,
            pub skills: Option<Vec<Skill>>
            pub required: Option<Requirements>
        }

        pub struct Skill {
            pub name: String,
            pub description: String
        }

    */
    attributes: [
        {
            name: "Strength",
            description: "Physical power and muscle mass"
        },
        {
            name: "Agility",
            description: "Dexterity and hand-eye coordination",
            skills: [
                {
                    name: "Stealth",
                    description: "The ability to move unseen"
                },
                {
                    name: "Acrobatics",
                    description: "The ability to perform feats of agility"
                },
                {
                    name: "Sleight of Hand",
                    description: "The ability to pick pockets and perform tricks"
                }
            ]
        },
        {
            name: "Vitality",
            description: "Health and stamina",
            skills: [
                {
                    name: "Endurance",
                    description: "The ability to resist fatigue"
                },
                {
                    name: "Resistance",
                    description: "The ability to resist poisons and diseases"
                },
                {
                    name: "Recovery",
                    description: "The ability to heal quickly"
                }
            ]
        },
        {
            name: "Authority",
            description: "Leadership and presence",
            skills: [
                {
                    name: "Persuasion",
                    description: "The ability to convince others"
                },
                {
                    name: "Deception",
                    description: "The ability to lie and mislead"
                }
            ]
        },
        {
            name: "Grit",
            description: "Mental fortitude and willpower",
            skils: [
                {
                    name: "Mental Fortitude",
                    description: "The ability to resist mental attacks"
                },
                {
                    name: "Willpower",
                    description: "The ability to resist fear and intimidation"
                },
                {
                    name: "Pain Tolerance",
                    description: "The ability to resist pain"
                }
            ]
        },
        {
            name: "Expertise",
            description: "Knowledge and experience",
            skills: [
                {
                    name: "Engineering",
                    description: "The ability to repair and modify technology"
                },
                {
                    name: "Medicine",
                    description: "The ability to heal and treat injuries"
                },
                {
                    name: "Sense Motive",
                    description: "The ability to read others"
                },
                {
                    name: "Piloting",
                    description: "The ability to fly and navigate vehicles"
                },
                {
                    name: "Survival",
                    description: "The ability to live off the land"
                }
            ]
        },
        {
            name: "Force",
            description: "The ability to use the Force",
            required: {
                perks: ["Force Sensitive"]
            },
            skills: [
                {
                    name: "Force Sense",
                    description: "The ability to sense with the Force"
                },
                {
                    name: "Force Push",
                    description: "The ability to push objects with the Force"
                },
                {
                    name: "Force Pull",
                    description: "The ability to pull objects with the Force"
                },
                {
                    name: "Force Jump",
                    description: "The ability to jump great distances with the Force"
                },
                {
                    name: "Force Heal",
                    description: "The ability to heal wounds with the Force"
                },
                {
                    name: "Force Lightning",
                    description: "The ability to shoot lightning with the Force"
                }
            ]
        }
    ],

}`;