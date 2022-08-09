const StackTracey = require("stacktracey");
const color = require("colors");
const { inspect } = require("util");

function overrideConsole () {
    const spaces = 6;

    function override (name, colour) {
        const base = console[name];
        const padding = Math.max(spaces-name.length, 0);

        console[name] = (...o) => {
            const t = new Date();
            const stack = new StackTracey();

            const text = o.map(x => typeof x == 'string' ? x : inspect(x)).join(' ')
                .replace(/\n/g, `\n${" ".repeat(spaces+6)}`)
                .replace(/\b\d+\b/g, '$&'.blue);

            base(
                `${t.getHours().toString().padStart(2, '0')}:${t.getMinutes().toString().padStart(2, '0')}`.bold.gray,
                `${" ".repeat(padding)}${name.toUpperCase().bold[colour]}`,
                `${stack.items[1].fileRelative.underline.cyan} ${stack.items[1].callee ? `@ ${stack.items[1].callee.cyan}` : ""}\n${" ".repeat(spaces+6)}`,
                text, '\n'
            )
        }
    }

    override('log', 'cyan');
    override('info', 'blue');
    override('warn', 'yellow');
    override('error', 'red');
    override('debug', 'white');
}

module.exports = overrideConsole;