/* Shared packaging/publication policy. This workflow intentionally publishes stable releases only. */
'use strict';
function assertStableVersion(version){
 if(typeof version!=='string'||version.trim()!==version||!/^(?:0|[1-9][0-9]*)\.(?:0|[1-9][0-9]*)\.(?:0|[1-9][0-9]*)$/.test(version))throw Error('Stable releases only: version must be a semantic version X.Y.Z with no leading zeros, prerelease suffix, build metadata or whitespace.');
 return version;
}
module.exports={assertStableVersion};
