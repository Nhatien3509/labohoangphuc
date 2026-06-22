// convention-scan: scan changed files against Go_Service_Convention.
//
// Usage:
//
//	convention-scan [--format text|md] [--no-color] [--paths-from -|<file>] [paths...]
//
// Reads paths from CLI args, from a file (--paths-from), or from stdin
// (--paths-from -). Files in src/web/ are skipped (FE has its own convention).
//
// Exit codes:
//
//	0  no violations
//	1  warnings only (push allowed)
//	2  one or more CRITICAL violations (push blocked)
package main

import (
	"bufio"
	"flag"
	"fmt"
	"io"
	"os"
	"strings"

	"convention-scan/internal/checks"
	"convention-scan/internal/report"
)

func main() {
	var (
		format    = flag.String("format", "text", "Output format: text | md")
		pathsFrom = flag.String("paths-from", "", `Read paths from this file (use "-" for stdin)`)
		noColor   = flag.Bool("no-color", false, "Disable ANSI colors in text output")
		quiet     = flag.Bool("quiet", false, "Suppress output if there are no violations")
	)
	flag.Parse()

	paths := flag.Args()
	if *pathsFrom != "" {
		extra, err := readPathsFrom(*pathsFrom)
		if err != nil {
			fmt.Fprintf(os.Stderr, "convention-scan: %v\n", err)
			os.Exit(2)
		}
		paths = append(paths, extra...)
	}

	paths = dedup(paths)
	if len(paths) == 0 {
		if !*quiet {
			fmt.Fprintln(os.Stderr, "convention-scan: no input paths")
		}
		os.Exit(0)
	}

	res, errs := checks.Run(paths)
	for _, err := range errs {
		fmt.Fprintf(os.Stderr, "convention-scan: parse error: %v\n", err)
	}

	if len(res.Violations) == 0 && *quiet {
		os.Exit(0)
	}

	switch *format {
	case "md":
		report.Markdown(os.Stdout, res)
	default:
		useColor := !*noColor && isTerminal(os.Stdout)
		report.Text(os.Stdout, res, useColor)
	}

	switch {
	case res.HasCritical():
		os.Exit(2)
	case len(res.Violations) > 0:
		os.Exit(1)
	default:
		os.Exit(0)
	}
}

func readPathsFrom(src string) ([]string, error) {
	var r io.Reader
	if src == "-" {
		r = os.Stdin
	} else {
		f, err := os.Open(src)
		if err != nil {
			return nil, err
		}
		defer f.Close()
		r = f
	}

	var paths []string
	scanner := bufio.NewScanner(r)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		paths = append(paths, line)
	}
	return paths, scanner.Err()
}

func dedup(in []string) []string {
	seen := map[string]bool{}
	out := make([]string, 0, len(in))
	for _, p := range in {
		if seen[p] {
			continue
		}
		seen[p] = true
		out = append(out, p)
	}
	return out
}

func isTerminal(f *os.File) bool {
	// Best-effort check — stdlib has no portable way; assume non-TTY when
	// stdout is being piped/redirected (file mode is regular).
	info, err := f.Stat()
	if err != nil {
		return false
	}
	return (info.Mode() & os.ModeCharDevice) != 0
}
