

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
  'space.hypna.feature.images.scatter': {
    'id': 'space.hypna.feature.images.scatter',
    '$schema': 'https://hypna.space/hypnospec/draft/2025-07/schemas/feature/space.hypna.feature.images.scatter/',
    'version': '2025-07',
    'configuration': {
      'images': [],
      'images_handled_by_outside_source': true,
      'spawn_frequency': '1500',
      'lifetime': '4000',
      'fade_duration': '800',
      'max_images': 6,
      'size': 25,
      'zoom_from': 0.6,
      'opacity': 0.9
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
  'space.hypna.feature.spirals.customgl': {
    'id': 'space.hypna.feature.spirals.customgl',
    '$schema': 'https://hypna.space/hypnospec/draft/2025-07/schemas/feature/space.hypna.feature.spirals.customgl/',
    'version': '2025-07',
    'configuration': {
      'opacity': '0.6',
      'spiral_color': '#FFFFFF',
      'bg_color': '#000000',
      'spin_speed': 1,
      'throb_speed': 2,
      'throb_strength': 1,
      'zoom': 1,
      'fragment_source': `// Custom spiral fragment shader (WebGL 1 / GLSL ES 1.0).
// Uniforms provided by the player (declare only the ones you use):
//   float iTime          seconds since the spiral started
//   vec2  iRes           canvas resolution in pixels
//   vec2  u_resolution   same as iRes
//   vec3  spiralColor    the "Spiral Color" setting (0.0-1.0 rgb)
//   vec3  bgColor        the "Background Color" setting (0.0-1.0 rgb)
//   float spinSpeed, throbSpeed, throbStrength, zoom   the numeric settings
precision highp float;

#define PI 3.1415926538

uniform vec2 u_resolution;

uniform vec2 iRes;
uniform float iTime;

uniform vec3 spiralColor;
uniform vec3 bgColor;

uniform float spinSpeed;
uniform float throbSpeed;
uniform float throbStrength;
uniform float zoom;

void main() {
    vec2 fragCoord = gl_FragCoord.xy;
    vec2 uv = (fragCoord - 0.5 * u_resolution) / u_resolution.y;
    vec2 truPos = uv;

    float angle = atan(truPos.y, truPos.x);
    float dist = pow(length(truPos), .4 + sin((iTime + cos(iTime * .05) * 0.1) * throbSpeed) * 0.2 * throbStrength);

    float spiFactor = pow(sin(dist * 40. * zoom - iTime * 5. * spinSpeed) + 1.0, 50.);
    spiFactor = clamp(spiFactor, 0., 1.);

    vec3 color = mix(spiralColor, bgColor, spiFactor);
    gl_FragColor = vec4(color, 1.0);
}
`
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
