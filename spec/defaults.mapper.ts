

export const specDefaults: any = {
  'space.hypna.feature.content.lines': {
    'id': 'space.hypna.feature.content.lines',
    '$schema': 'https://hypna.space/hypnospec/draft/2025-07/schemas/feature/space.hypna.feature.content.lines/',
    'version': '2025-07',
    'configuration': {
      'lines': []
    }
  },
  'space.hypna.feature.content.time': {
    'id': 'space.hypna.feature.content.time',
    '$schema': 'https://hypna.space/hypnospec/draft/2025-07/schemas/feature/space.hypna.feature.content.time/',
    'version': '2025-07',
    'configuration': {
      'time': 0
    }
  },
  'space.hypna.feature.content.text': {
    'id': 'space.hypna.feature.content.text',
    '$schema': 'https://hypna.space/hypnospec/draft/2025-07/schemas/feature/space.hypna.feature.content.text/',
    'version': '2025-07',
    'configuration': {
      'text': ''
    }
  },
  'space.hypna.feature.content.distractors': {
    'id': 'space.hypna.feature.content.distractors',
    '$schema': 'https://hypna.space/hypnospec/draft/2025-07/schemas/feature/space.hypna.feature.content.distractors/',
    'version': '2025-07',
    'configuration': {
      'lines': [],
      'duration': '3501',
      'base_frequency': '1501',
      'base_random_offset': true
    }
  },
  'space.hypna.feature.images.basic': {
    'id': 'space.hypna.feature.images.basic',
    '$schema': 'https://hypna.space/hypnospec/draft/2025-07/schemas/feature/space.hypna.feature.images.basic/',
    'version': '2025-07',
    'configuration': {
      'images': [],
      'switch_frequency': '950',
      'images_handled_by_outside_source': true
    }
  },
  'space.hypna.feature.settings.audio': {
    'id': 'space.hypna.feature.settings.audio',
    '$schema': 'https://hypna.space/hypnospec/draft/2025-07/schemas/feature/space.hypna.feature.settings.audio/',
    'version': '2025-07',
    'configuration': {
      'url': ''
    }
  },
  'space.hypna.feature.settings.customCSS': {
    'id': 'space.hypna.feature.settings.customCSS',
    '$schema': 'https://hypna.space/hypnospec/draft/2025-07/schemas/feature/space.hypna.feature.settings.customCSS/',
    'version': '2025-07',
    'configuration': {
      'data': ''
    }
  },
  'space.hypna.feature.settings.bst': {
    'id': 'space.hypna.feature.settings.bst',
    '$schema': 'https://hypna.space/hypnospec/draft/2025-07/schemas/feature/space.hypna.feature.settings.bst/',
    'version': '2025-07',
    'configuration': {
      'word_duration': '500'
    }
  },
  'space.hypna.feature.settings.mst': {
    'id': 'space.hypna.feature.settings.mst',
    '$schema': 'https://hypna.space/hypnospec/draft/2025-07/schemas/feature/space.hypna.feature.settings.mst/',
    'version': '2025-07',
    'configuration': {
      'line_duration': '3500'
    }
  },
  'space.hypna.feature.settings.distractors.wall': {
    'id': 'space.hypna.feature.settings.distractors.wall',
    '$schema': 'https://hypna.space/hypnospec/draft/2025-07/schemas/feature/space.hypna.feature.settings.distractors.wall/',
    'version': '2025-07',
    'configuration': {
      'enabled': false,
      'rerender_frequency': '3500'
    }
  },
  'space.hypna.feature.settings.distractors.basic': {
    'id': 'space.hypna.feature.settings.distractors.basic',
    '$schema': 'https://hypna.space/hypnospec/draft/2025-07/schemas/feature/space.hypna.feature.settings.distractors.basic/',
    'version': '2025-07',
    'configuration': {
      'enabled': true,
    }
  },
  'space.hypna.feature.spirals.media': {
    'id': 'space.hypna.feature.spirals.media',
    '$schema': 'https://hypna.space/hypnospec/draft/2025-07/schemas/feature/space.hypna.feature.spirals.media/',
    'version': '2025-07',
    'configuration': {
      'media_url': '/static/utils/large.gif',
      'media_is_image': true,
      'media_opacity': '0.5'
    }
  },
  'space.hypna.feature.spirals.webgl': {
    'id': 'space.hypna.feature.spirals.webgl',
    '$schema': 'https://hypna.space/hypnospec/draft/2025-07/schemas/feature/space.hypna.feature.spirals.webgl/',
    'version': '2025-07',
    'configuration': {
      'opacity': '0.6',
      'spiral_color': '#FFFFFF',
      'bg_color': '#000000',
      'spin_speed': 1,
      'throb_speed': 2,
      'throb_strength': 1,
      'zoom': 1
    }
  },
  'space.hypna.feature.settings.yss': {
    'id': 'space.hypna.feature.settings.yss',
    '$schema': 'https://hypna.space/hypnospec/draft/2025-07/schemas/feature/space.hypna.feature.settings.yss/',
    'version': '2025-07',
    'configuration': {
      'enabled': true
    }
  },
  'space.hypna.feature.settings.ect': {
    'id': 'space.hypna.feature.settings.ect',
    '$schema': 'https://hypna.space/hypnospec/draft/2025-07/schemas/feature/space.hypna.feature.settings.ect/',
    'version': '2025-07',
    'configuration': {
      'wrongWords': [],
      'punishment': []
    }
  },
  'space.hypna.feature.settings.wlt': {
    'id': 'space.hypna.feature.settings.wlt',
    '$schema': 'https://hypna.space/hypnospec/draft/2025-07/schemas/feature/space.hypna.feature.settings.wlt/',
    'version': '2025-07',
    'configuration': {
      'interrupters': [],
      'punishment': [],
      'interrupters_enabled': true,
      'overlay_display_time': '3000',
      'interrupters_frequency': '40',
      'add_lines_as_punishment': 0,
      'interrupters_freq_random': true
    }
  },
  'space.hypna.feature.settings.stt': {
    'id': 'space.hypna.feature.settings.stt',
    '$schema': 'https://hypna.space/hypnospec/draft/2025-07/schemas/feature/space.hypna.feature.settings.stt/',
    'version': '2025-07',
    'configuration': {

    }
  },
  'space.hypna.feature.settings.act': {
    'id': 'space.hypna.feature.settings.act',
    '$schema': 'https://hypna.space/hypnospec/draft/2025-07/schemas/feature/space.hypna.feature.settings.act/',
    'version': '2025-07',
    'configuration': {

    }
  }
}
