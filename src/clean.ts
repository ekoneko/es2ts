import * as fs from 'fs'
import * as path from 'path'
import * as glob from 'glob'

export default function (projectDir, options: any = {}) {
  const files = glob.sync(path.join(projectDir, '**/*.ts*'), options)
  files.forEach(f => {
    const js = f.replace(/\.tsx?$/, '.js')
    if (fs.existsSync(js)) {
      console.log('[unlink]', js)
      fs.unlinkSync(js)
    }
  })
}
