const html = arg => arg.join(''); // NOOP, for editor integration.

export default {
  template: html`
    <table class="music-table custom-music">
      <tr>
        <th class="song-name">name</th>
        <th class="song-jpname">jpname</th>
        <th class="song-artist">artist</th>
        <th class="song-jpartist">jpartist</th>
        <th class="song-genre">genre</th>
        <th class="song-genre">override</th>
        <th class="song-source">source</th>
        <th class="song-loop">loop</th>
        <th class="song-loop-start">loopStart</th>
        <th class="song-loop-length">loopLength</th>
      </tr>

      <tr class="song" v-for="song of music">
        <td class="song-name">
          <input type="text" v-model="song.metadata.name" />
        </td>
        <td class="song-jpname">
          <input type="text" v-model="song.metadata.jpname" />
        </td>
        <td class="song-artist">
          <input type="text" v-model="song.metadata.artist" />
        </td>
        <td class="song-jpartist">
          <input type="text" v-model="song.metadata.jpartist" />
        </td>
        <td class="song-genre">
          <select v-model="song.metadata.genre">
            <option value="CALM">Calm</option>
            <option value="BATTLE">Battle</option>
            <option value="INTERFACE">Interface</option>
            <option value="OVERRIDE">Override</option>
            <option value="DISABLED">Disabled/Music graph only</option>
          </select>
        </td>
        <td>
          <select v-model="song.override" v-if="song.metadata.genre == 'OVERRIDE'">
            <option value="null">Nothing</option>
            <option :value="key" v-for="[key, song] of Object.entries(builtin || {})">
              {{ song.name }}
            </option>
          </select>
        </td>
        <td class="song-source">
          <input type="text" v-model="song.metadata.source" />
        </td>
        <td class="song-loop">
          <input type="checkbox" v-model.boolean="song.metadata.loop" />
        </td>
        <td class="song-loop-start">
          <input type="number" v-model.number="song.metadata.loopStart" />
        </td>
        <td class="song-loop-length">
          <input type="number" v-model.number="song.metadata.loopLength" />
        </td>
      </tr>
    </table>

    <!-- <div v-if="!builtin" class="built-in-music loading">
      Fetching built-in music list...
    </div>
    <table v-else class="music-table built-in-music">
      <tr>
        <th class="song-name">name</th>
        <th class="song-jpname">jpname</th>
        <th class="song-artist">artist</th>
        <th class="song-jpartist">jpartist</th>
        <th class="song-genre">genre</th>
        <th class="song-source">source</th>
        <th class="song-loop">loop</th>
        <th class="song-loop-start">loopStart</th>
        <th class="song-loop-length">loopLength</th>
      </tr>
      <tr class="song" v-for="song of builtin">
        <td class="song-name">{{ song.name }}</td>
        <td class="song-jpname">{{ song.jpname }}</td>
        <td class="song-artist">{{ song.artist }}</td>
        <td class="song-jpartist">{{ song.jpartist }}</td>
        <td class="song-genre">{{ song.genre }}</td>
        <td class="song-source">{{ song.source }}</td>
        <td class="song-loop">{{ song.loop }}</td>
        <td class="song-loop-start">{{ song.loopStart }}</td>
        <td class="song-loop-length">{{ song.loopLength }}</td>
      </tr>
    </table> -->
  `,
  props: ['music', 'builtin']
}
