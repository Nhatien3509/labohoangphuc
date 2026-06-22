package report

import (
	"fmt"
	"io"
	"sort"
	"strings"
	"time"

	"convention-scan/internal/checks"
)

const (
	colorReset  = "\033[0m"
	colorRed    = "\033[31m"
	colorYellow = "\033[33m"
	colorGreen  = "\033[32m"
	colorBold   = "\033[1m"
	colorDim    = "\033[2m"
)

// Text writes a terminal-friendly report (with ANSI colors when useColor=true).
func Text(w io.Writer, res *checks.Result, useColor bool) {
	red := pick(colorRed, useColor)
	yellow := pick(colorYellow, useColor)
	green := pick(colorGreen, useColor)
	bold := pick(colorBold, useColor)
	dim := pick(colorDim, useColor)
	reset := pick(colorReset, useColor)

	critical := res.CountBySeverity(checks.SeverityCritical)
	warning := res.CountBySeverity(checks.SeverityWarning)

	fmt.Fprintf(w, "%sCONVENTION SCAN%s — %d files scanned\n", bold, reset, res.FilesCount)
	fmt.Fprintf(w, "%sScan time:%s %s\n\n", dim, reset, time.Now().Format("2006-01-02 15:04:05"))

	if critical == 0 && warning == 0 {
		fmt.Fprintf(w, "%s✓ PASS — no convention violations%s\n", green, reset)
		return
	}

	fmt.Fprintf(w, "%sSummary:%s %s%d CRITICAL%s, %s%d WARNING%s\n\n",
		bold, reset,
		red, critical, reset,
		yellow, warning, reset,
	)

	grouped := groupBySeverityAndSection(res.Violations)
	severities := []checks.Severity{checks.SeverityCritical, checks.SeverityWarning}
	for _, sev := range severities {
		sections, ok := grouped[sev]
		if !ok {
			continue
		}
		color := yellow
		label := "WARNING"
		if sev == checks.SeverityCritical {
			color = red
			label = "CRITICAL — sẽ block push"
		}
		fmt.Fprintf(w, "%s%s [%s]%s\n", bold, color, label, reset)

		sectionIDs := sortedKeys(sections)
		for _, sid := range sectionIDs {
			vs := sections[sid]
			fmt.Fprintf(w, "  %sSection %s — %s%s (%d)\n", bold, sid, vs[0].Section, reset, len(vs))
			for _, v := range vs {
				fmt.Fprintf(w, "    %s%s:%d%s  %s%s%s\n",
					dim, v.File, v.Line, reset,
					bold, v.Function, reset,
				)
				fmt.Fprintf(w, "      → %s\n", v.Message)
				if v.Hint != "" {
					fmt.Fprintf(w, "      %s%s%s\n", dim, v.Hint, reset)
				}
			}
		}
		fmt.Fprintln(w)
	}

	if critical > 0 {
		fmt.Fprintf(w, "%s%s✗ Push bị block — fix %d CRITICAL violations trước khi push lại%s\n",
			bold, red, critical, reset)
	} else {
		fmt.Fprintf(w, "%s%s⚠ Push được phép — %d WARNING (không block)%s\n",
			bold, yellow, warning, reset)
	}
}

// Markdown writes a SCAN-report-style markdown document.
func Markdown(w io.Writer, res *checks.Result) {
	critical := res.CountBySeverity(checks.SeverityCritical)
	warning := res.CountBySeverity(checks.SeverityWarning)
	now := time.Now()
	scanID := now.Format("SCAN-20060102-150405")

	fmt.Fprintf(w, "# CONVENTION SCAN — PRE-PUSH\n\n")
	fmt.Fprintf(w, "**Scan ID:** %s\n", scanID)
	fmt.Fprintf(w, "**Thời gian:** %s\n", now.Format("2006-01-02 15:04:05"))
	fmt.Fprintf(w, "**Files quét:** %d\n\n", res.FilesCount)

	fmt.Fprintf(w, "## Tổng kết\n\n")
	fmt.Fprintf(w, "| Severity | Số violation |\n|---|---|\n")
	fmt.Fprintf(w, "| CRITICAL (block) | %d |\n", critical)
	fmt.Fprintf(w, "| WARNING | %d |\n\n", warning)

	if critical == 0 && warning == 0 {
		fmt.Fprintf(w, "✓ PASS — không có violation.\n")
		return
	}

	grouped := groupBySeverityAndSection(res.Violations)
	severities := []checks.Severity{checks.SeverityCritical, checks.SeverityWarning}
	for _, sev := range severities {
		sections, ok := grouped[sev]
		if !ok {
			continue
		}
		label := "WARNING"
		if sev == checks.SeverityCritical {
			label = "CRITICAL"
		}
		fmt.Fprintf(w, "## %s\n\n", label)

		for _, sid := range sortedKeys(sections) {
			vs := sections[sid]
			fmt.Fprintf(w, "### Section %s — %s (%d violations)\n\n", sid, vs[0].Section, len(vs))
			fmt.Fprintf(w, "| File | Line | Function | Vấn đề | Khuyến nghị |\n")
			fmt.Fprintf(w, "|---|---|---|---|---|\n")
			for _, v := range vs {
				fmt.Fprintf(w, "| `%s` | %d | `%s` | %s | %s |\n",
					v.File, v.Line, v.Function,
					escapeMD(v.Message), escapeMD(v.Hint),
				)
			}
			fmt.Fprintln(w)
		}
	}

	if critical > 0 {
		fmt.Fprintf(w, "\n> **Push bị block** — fix %d CRITICAL violations.\n", critical)
	}
}

func groupBySeverityAndSection(vs []checks.Violation) map[checks.Severity]map[string][]checks.Violation {
	out := map[checks.Severity]map[string][]checks.Violation{}
	for _, v := range vs {
		if out[v.Severity] == nil {
			out[v.Severity] = map[string][]checks.Violation{}
		}
		out[v.Severity][v.SectionID] = append(out[v.Severity][v.SectionID], v)
	}
	return out
}

func sortedKeys(m map[string][]checks.Violation) []string {
	keys := make([]string, 0, len(m))
	for k := range m {
		keys = append(keys, k)
	}
	sort.Strings(keys)
	return keys
}

func escapeMD(s string) string {
	s = strings.ReplaceAll(s, "|", `\|`)
	s = strings.ReplaceAll(s, "\n", " ")
	return s
}

func pick(code string, useColor bool) string {
	if !useColor {
		return ""
	}
	return code
}
