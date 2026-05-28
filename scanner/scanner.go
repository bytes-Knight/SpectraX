package scanner

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"sort"
	"strings"
	"time"

	"github.com/chromedp/chromedp"
)

type ScanResult struct {
	URL          string            `json:"url"`
	Parameter    string            `json:"parameter"`
	FoundIn      string            `json:"found_in"` // "HTML" or "DOM"
	CharAnalysis map[string]string `json:"char_analysis"`
}

func Uro(urls []string) []string {
	seen := make(map[string]bool)
	var filtered []string

	for _, rawURL := range urls {
		u, err := url.Parse(rawURL)
		if err != nil {
			continue
		}

		// Normalize host
		host := strings.ToLower(u.Host)
		
		// Normalize path (strip trailing slashes)
		path := strings.TrimRight(u.Path, "/")
		
		// Get sorted parameter keys
		params := u.Query()
		var keys []string
		for k := range params {
			keys = append(keys, k)
		}
		sort.Strings(keys)
		
		// Create structural fingerprint: host + path + sorted_keys
		fingerprint := fmt.Sprintf("%s%s?%s", host, path, strings.Join(keys, "&"))
		
		if !seen[fingerprint] {
			seen[fingerprint] = true
			filtered = append(filtered, rawURL)
		}
	}

	return filtered
}

func InjectPayload(targetURL, payload string) []struct{ URL, Param string } {
	var results []struct{ URL, Param string }
	u, err := url.Parse(targetURL)
	if err != nil {
		return results
	}

	params := u.Query()
	for key := range params {
		newParams := url.Values{}
		for k, v := range params {
			if k == key {
				newParams.Set(k, payload)
			} else {
				newParams.Set(k, v[0])
			}
		}
		newU := *u
		newU.RawQuery = newParams.Encode()
		results = append(results, struct{ URL, Param string }{newU.String(), key})
	}

	return results
}

func CheckReflectionHTML(targetURL, payload string) bool {
	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Get(targetURL)
	if err != nil {
		return false
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return false
	}

	return strings.Contains(string(body), payload)
}

func CheckReflectionDOM(targetURL, payload string) bool {
	ctx, cancel := chromedp.NewContext(context.Background())
	defer cancel()

	ctx, cancel = context.WithTimeout(ctx, 15*time.Second)
	defer cancel()

	var htmlContent string
	err := chromedp.Run(ctx,
		chromedp.Navigate(targetURL),
		chromedp.Sleep(2*time.Second),
		chromedp.OuterHTML("html", &htmlContent),
	)

	if err != nil {
		return false
	}

	return strings.Contains(htmlContent, payload)
}

func AnalyzeChars(targetURL, parameter string) map[string]string {
	chars := []string{"\"", "'", "<", ">", "$", "|", "(", ")", "`", ":", ";", "{", "}"}
	analysis := make(map[string]string)

	for _, c := range chars {
		payload := "rix4uni" + c
		u, _ := url.Parse(targetURL)
		params := u.Query()
		params.Set(parameter, payload)
		u.RawQuery = params.Encode()

		client := &http.Client{Timeout: 5 * time.Second}
		resp, err := client.Get(u.String())
		if err != nil {
			analysis[c] = "Blocked"
			continue
		}
		defer resp.Body.Close()
		body, _ := io.ReadAll(resp.Body)
		bodyStr := string(body)

		if strings.Contains(bodyStr, payload) {
			analysis[c] = "Allowed"
		} else if strings.Contains(bodyStr, "rix4uni"+HTMLEscape(c)) {
			analysis[c] = "Converted"
		} else {
			analysis[c] = "Blocked"
		}
	}

	return analysis
}

func HTMLEscape(c string) string {
	switch c {
	case "<":
		return "&lt;"
	case ">":
		return "&gt;"
	case "\"":
		return "&quot;"
	case "'":
		return "&#39;"
	case "&":
		return "&amp;"
	case "$":
		return "&#36;"
	case "|":
		return "&#124;"
	case "(":
		return "&#40;"
	case ")":
		return "&#41;"
	case "`":
		return "&#96;"
	case ":":
		return "&#58;"
	case ";":
		return "&#59;"
	case "{":
		return "&#123;"
	case "}":
		return "&#125;"
	default:
		return c
	}
}
