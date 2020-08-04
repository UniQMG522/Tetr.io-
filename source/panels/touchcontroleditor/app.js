const html = arg => arg.join(''); // NOOP, for editor integration.

const app = new Vue({
  template: html`
    <div>
      <button @click="save">Save changes</button>
      <span :style="{ opacity: this.saveOpacity }">Saved!</span><br />

      Touch control mode:
      <select v-model="config.mode">
        <option value="touchpad">Touchpad</option>
        <option value="keys">Touchkeys</option>
        <option value="hybrid">Both</option>
      </select>

      <template v-if="config.mode != 'keys'">
        <div class="form-control">
          Deadzone
          <input type="range" min="10" max="250" v-model.number="config.deadzone" />
          {{ config.deadzone }}px

          (<input type="checkbox" v-model="visualizeDeadzone" />
          visualize)
        </div>

        <div class="touch-preview" :style="touchPreviewStyle">
          <div class="touch-zone">
            <selector side="top" v-model="config.binding.L_up"></selector>
            <selector side="left" v-model="config.binding.L_left"></selector>
            <selector side="right" v-model="config.binding.L_right"></selector>
            <selector side="bottom" v-model="config.binding.L_down"></selector>
          </div>
          <div class="touch-zone">
            <selector side="top" v-model="config.binding.R_up"></selector>
            <selector side="left" v-model="config.binding.R_left"></selector>
            <selector side="right" v-model="config.binding.R_right"></selector>
            <selector side="bottom" v-model="config.binding.R_down"></selector>
          </div>
        </div>
      </template>

      <div class="key-configurator-container" v-if="config.mode != 'touchpad'">
        <button @click="addKey()">Add key</button>
        Binding:
        <template v-if="!selectedKey">
          <select><option default disabled>Select a key</option></select>
          <button disabled>Delete</button>
          Behavior:
          <select><option default disabled>Select a key</option></select>
          <button disabled>Move to top</button>
          <button disabled>Move to bottom</button>
        </template>
        <template v-else>
          <selector side="none" v-model="selectedKey.bind"></selector>
          <button @click="deleteKey(selectedKey)">Delete</button>
          <select v-model="selectedKey.behavior">
            <option value="hover">Touch can start elsewhere (hover)</option>
            <option value="tap">Touch must start on key (tap)</option>
          </select>
          <button @click="moveTop(selectedKey)">Move to top</button>
          <button @click="moveBottom(selectedKey)">Move to bottom</button>
        </template>

        <div class="key-configurator" ref="keyContainer">
          <template v-if="config.mode == 'hybrid' && showDeadzoneOnKeys">
            <div class="touch-zone" :style="{ '--deadzone': config.deadzone + 'px' }"></div>
            <div class="touch-zone right" :style="{ '--deadzone': config.deadzone + 'px' }"></div>
          </template>
          <div
            class="key"
            :key="i"
            :index="i"
            v-for="(key, i) of config.keys"
            :class="{ selected: selectedKey == key }"
            :style="keyStyle(key)"
          >
            {{ key.bind }}<br>
            x {{ (key.x).toFixed(1) }} %<br>
            y {{ (key.y).toFixed(1) }} %<br>
            w {{ (key.w).toFixed(1) }} %<br>
            h {{ (key.h).toFixed(1) }} %<br>
            mode: {{ key.behavior }}
          </div>
        </div>
        <template v-if="config.mode == 'hybrid'">
          <input type="checkbox" v-model="showDeadzoneOnKeys" />
          <span @click="showDeadzoneOnKeys = !showDeadzoneOnKeys">
            Preview touchpads on key editor
          </span>
        </template>
      </div>
    </div>
  `,
  components: {
    selector: {
      template: html`
        <select class="touch-bind-select" :class="side" v-model="subvalue">
          <option :value="null">&lt;None&gt;</option>
          <option value="moveLeft">Move left</option>
          <option value="moveRight">Move right</option>
          <option value="hardDrop">Hard drop</option>
          <option value="softDrop">Soft drop</option>
          <option value="rotateCCW">Rotate CCW</option>
          <option value="rotateCW">Rotate CW</option>
          <option value="rotate180">Rotate 180</option>
          <option value="hold">Hold</option>
          <option value="retry">Retry</option>
          <option value="exit">Exit</option>
          <option value="fullscreen">Fullscreen</option>
        </select>
      `,
      props: ['side', 'value'],
      data: () => ({ subvalue: true }),
      watch: {
        value: { immediate: true, handler(val) { this.subvalue = val; } },
        subvalue(val) { this.$emit('input', val); }
      }
    }
  },
  data: {
    visualizeDeadzone: false,
    showDeadzoneOnKeys: true,
    selectedKey: null,
    saveOpacity: 0,
    config: {
      mode: 'touchpad', // touchpad | hybrid | keys
      deadzone: 100,
      binding: {
        L_left: 'moveLeft',
        L_right: 'moveRight',
        L_up: 'hardDrop',
        L_down: 'softDrop',
        R_left: 'rotateCCW',
        R_right: 'rotateCW',
        R_up: 'rotate180',
        R_down: 'hold'
      },
      keys: [
        { x: 50, y: 50, w: 20, h: 20, behavior: 'hover', bind: 'moveLeft'  },
        { x: 50, y: 50, w: 20, h: 20, behavior: 'hover', bind: 'moveRight' },
        { x: 50, y: 50, w: 20, h: 20, behavior: 'hover', bind: 'hardDrop'  },
        { x: 50, y: 50, w: 20, h: 20, behavior: 'hover', bind: 'softDrop'  },
        { x: 50, y: 50, w: 20, h: 20, behavior: 'hover', bind: 'rotateCCW' },
        { x: 50, y: 50, w: 20, h: 20, behavior: 'hover', bind: 'rotateCW'  },
        { x: 50, y: 50, w: 20, h: 20, behavior: 'hover', bind: 'rotate180' },
        { x: 50, y: 50, w: 20, h: 20, behavior: 'hover', bind: 'hold'      }
      ]
    },
    boundingRect: { width: 1, height: 1 }
  },
  watch: {
    'config.mode': function() {
      this.updateBoundingRect();
    }
  },
  methods: {
    toPercent({ x, y, w, h }) {
      let { width, height } = this.boundingRect;
      return {
        x: (x + w/2) / width * 100,
        y: (y + h/2) / height * 100,
        w: w / width * 100,
        h: h / height * 100
      }
    },
    toPixels({ x, y, w, h }) {
      let { width, height } = this.boundingRect;
      w = w / 100 * width;
      h = h / 100 * height;
      x = (x/100 * width) - w/2;
      y = (y/100 * height) - h/2;
      return { x, y, w, h };
    },
    keyStyle(key) {
      let { x, y, w, h } = this.toPixels(key);
      return {
        '--x': x + 'px',
        '--y': y + 'px',
        '--width': w + 'px',
        '--height': h + 'px',
      }
    },
    updateBoundingRect() {
      Vue.nextTick(() => {
        if (!this.$refs.keyContainer) return;
        let { width, height } = this.$refs.keyContainer.getBoundingClientRect();
        this.boundingRect.width = width;
        this.boundingRect.height = height;
      });
    },
    addKey() {
      this.config.keys.splice(0, 0, {
        x: 50,
        y: 50,
        w: 20,
        h: 20,
        behavior: 'hover', // hover | tap
        bind: 'hardDrop'
      })
    },
    deleteKey(key) {
      let index = this.config.keys.indexOf(key);
      this.config.keys.splice(index, 1);
      if (key == this.selectedKey)
        this.selectedKey = null;
    },
    moveTop(key) {
      let index = this.config.keys.indexOf(key);
      this.config.keys.splice(index, 1);
      this.config.keys.push(key);
    },
    moveBottom(key) {
      let index = this.config.keys.indexOf(key);
      this.config.keys.splice(index, 1);
      this.config.keys.splice(0, 0, key);
    },
    save() {
      browser.storage.local.set({
        touchControlConfig: JSON.stringify(this.config)
      });
      this.saveOpacity = 1.25;
      let timeout = setInterval(() => {
        this.saveOpacity -= 0.1;
        if (this.saveOpacity <= 0)
          clearTimeout(timeout);
      }, 50);
    }
  },
  async mounted() {
    let configObj = await browser.storage.local.get('touchControlConfig');
    let config = configObj.touchControlConfig;
    if (config) this.config = JSON.parse(config);

    this.updateBoundingRect();
    window.addEventListener('resize', () => {
      this.updateBoundingRect();
      console.log("resize");
    });

    window.addEventListener('keyup', event => {
      if (!this.selectedKey) return;

      switch (event.key) {
        case 'Delete':
          this.deleteKey(this.selectedKey);
          break;

        case 't':
          this.moveTop(this.selectedKey);
          break;

        case 'b':
          this.moveBottom(this.selectedKey);
          break;
      }
    });

    let that = this;
    interact('.key')
      .resizable({
        edges: { left: true, right: true, bottom: true, top: true },
        modifiers: [
          // keep the edges inside the parent
          interact.modifiers.restrictEdges({
            outer: 'parent'
          }),

          // minimum size
          interact.modifiers.restrictSize({
            min: { width: 50, height: 50 }
          })
        ],
        listeners: {
          move: (event) => {
            let index = event.target.getAttribute('index');
            let key = this.config.keys[index];
            this.selectedKey = key;

            let { x, y, w, h } = this.toPixels(key);
            x += event.deltaRect.left;
            y += event.deltaRect.top;
            w = event.rect.width;
            h = event.rect.height;
            Object.assign(key, this.toPercent({ x, y, w, h }));
          }
        }
      })
      .draggable({
        listeners: {
          move: (event) => {
            let index = event.target.getAttribute('index');
            let key = this.config.keys[index];
            this.selectedKey = key;

            let { x, y, w, h } = this.toPixels(key);
            y += event.dy;
            x += event.dx;
            Object.assign(key, this.toPercent({ x, y, w, h }));
          }
        },
        modifiers: [
          interact.modifiers.restrictRect({
            restriction: 'parent'
          })
        ]
      })
      .on('tap', event => {
        let index = event.target.getAttribute('index');
        this.selectedKey = this.config.keys[index];
      });
  },
  computed: {
    touchPreviewStyle() {
      return {
        '--deadzone': (this.visualizeDeadzone ? this.config.deadzone : 100) + 'px'
      }
    }
  }
});

app.$mount('#app');
