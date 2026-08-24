
export const sessionBaseRequirements: any = {
  "bst": [
    {
      "allOf": [
        "space.hypna.feature.content.lines",
        "space.hypna.feature.content.time",
        "space.hypna.feature.settings.bst"
      ]
    },
    {
      "either": [
        "space.hypna.feature.images.basic"
      ]
    },
    {
      "either": [
        "space.hypna.feature.spirals.media",
        "space.hypna.feature.spirals.webgl",
        "space.hypna.feature.spirals.customgl"
      ]
    }
  ],
  "mst": [
    {
      "allOf": [
        "space.hypna.feature.content.lines",
        "space.hypna.feature.settings.mst"
      ]
    },
    {
      "either": [
        "space.hypna.feature.images.basic"
      ]
    },
    {
      "either": [
        "space.hypna.feature.spirals.media",
        "space.hypna.feature.spirals.webgl",
        "space.hypna.feature.spirals.customgl"
      ]
    }
  ],
  "wlt": [
    {
      "allOf": [
        "space.hypna.feature.settings.wlt",
        "space.hypna.feature.content.text",
        "space.hypna.feature.content.time"
      ]
    }
  ],
  "act": [
    {
      "allOf": [
        "space.hypna.feature.content.text",
        "space.hypna.feature.settings.act"
      ]
    }
  ],
  "ast": [],
  "ect": [
    {
      "allOf": [
        "space.hypna.feature.content.text",
        "space.hypna.feature.settings.ect",
        "space.hypna.feature.content.time"
      ]
    }
  ],
  "stt": [
    {
      "allOf": [
        "space.hypna.feature.settings.stt",
        "space.hypna.feature.content.lines"
      ]
    }
  ]
}
