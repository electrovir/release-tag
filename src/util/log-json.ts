import {AnyObject, log, logColors, type LogColorKey} from '@augment-vir/common';

/** Log a JSON object in such a way that it'll render correctly in GitHub's workflow logs. */
export function logJson(json: AnyObject | undefined, logType: LogColorKey | `${LogColorKey}`) {
    if (json) {
        log[logType](
            JSON.stringify(json, null, 4)
                .split('\n')
                .map((line) => `${logColors[logType]}    ${line}`)
                .join('\n') + '\n',
        );
    } else {
        log[logType]('undefined');
    }
}
