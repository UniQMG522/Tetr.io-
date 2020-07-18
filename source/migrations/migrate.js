const migrate = (() => {
  const migrations = [];

  function compare(version, target) {
    version = version.split('.').map(n => +n);
    target = target.split('.').map(n => +n);
    for (let i = 0; i < 3; i++) {
      if (version[i] > target[i]) return 1;
      if (version[i] < target[i]) return -1;
    }
    return 0;
  }

  /*
    v0.10.0 - Introduced migrations
    All this version adds is a version tag
  */
  migrations.push({
    version: '0.10.0',
    run: async dataSource => {
      await dataSource.set({ version: '0.10.0' });
    }
  });

  /*
    v0.12.0 - Music graph update
    Adds a bunch of new keys to the music graph
  */
  migrations.push({
    version: '0.12.0',
    run: async dataSource => {
      await dataSource.set({ version: '0.12.0' });

      let { musicGraph: json } = await dataSource.get('musicGraph');
      if (json) {
        let musicGraph = JSON.parse(json);

        let x = 0;
        for (let node of musicGraph) {
          node.x = (x += 30);
          node.y = 0;
          node.effects = { volume: 1, speed: 1 }
          for (let trigger of node.triggers) {
            trigger.anchor = {
              origin: { x: 100, y: 60 },
              target: { x: 100, y: 0 }
            }
            trigger.crossfade = false;
            trigger.crossfadeDuration = 1;
            trigger.locationMultiplier = 1;
          }
        }

        await dataSource.set({ musicGraph: JSON.stringify(musicGraph) });
      }
    }
  });

  return async function migrate(dataSource) {
    let { version: initialVersion} = await dataSource.get('version');
    if (!initialVersion) initialVersion = '0.0.0';

    for (let migration of migrations) {
      let { version } = await dataSource.get('version');
      if (!version) version = '0.0.0';
      let target = migration.version;

      console.log("Testing migration", version, target, compare(version, target));
      if (compare(version, target) == -1) {
        console.log("Running migration", migration);
        await migration.run(dataSource);
      }
    }

    return {
      from: initialVersion,
      to: (await dataSource.get('version')).version
    };
  }
})();
