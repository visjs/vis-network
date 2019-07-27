# vis-types

This is a partial fork of the [DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped) repository. 
Only the following files (including there history) are copied her:

- https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/vis/index.d.ts
- https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/vis/vis-tests.ts

To keep these files up-to-date you can cherry-pick commits tat are relevant to visjs:

```sh
git clone git@github.com:visjs/vis-types.git
cd vis-types
git remote add DefinitelyTyped https://github.com/DefinitelyTyped/DefinitelyTyped.git
git fetch DefinitelyTyped
```

Now got to [DefinitelyTyped/commits/master/types/vis](https://github.com/DefinitelyTyped/DefinitelyTyped/commits/master/types/vis) and see if there are new commits. Is so copy the hash. 

Then cherry-pick the interesting commits into this repository:

```sh
git cherry-pick 208e1e1ec9acd8d785c89de728cb2a79bb78757d
git push origin
```

Thanks for keeping this repository up-to-date!
