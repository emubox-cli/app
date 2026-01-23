package main

import (
	"encoding/json"
	"fmt"
	"os"
	"time"
)

type MapOfDoom map[string]any

type CartridgesGameFile struct {
	Added       int  `json:"added"`
	Blacklisted bool `json:"blacklisted"`
	Developer   string `json:"developer"`
	Executable  string `json:"executable"`
	GameId      string `json:"game_id"`
	Hidden      bool   `json:"hidden"`
	LastPlayed  int    `json:"last_played"`
	Name        string `json:"name"`
	Source      string `json:"source"`
	Version     float64 `json:"version"`
}

type ConfigInstallData struct {
	Id        string `json:"id"`
	Exec      string `json:"exec"`
	ReleaseId string `json:"releaseId"`
}

type Config struct {
	Installed []ConfigInstallData `json:"installed"`
	RomDir    string `json:"romDir"`
	SaveDir   string `json:"saveDir"`
	SgdbToken string `json:"sgdbToken"`
}

type AppData struct {
	Name           string   `json:"n"`
	Id             string   `json:"i"`
	Consoles       []string `json:"c"`
	InstallOptions []string `json:"o"`
	Exec           string   `json:"e,omitempty"`
	RegexQuery     string   `json:"r,omitempty"`
} 

type AppDetails struct {
	Version      string    `json:"v"`
	Applications []AppData `json:"a"`
}

type FetchedAppData struct {
	Extends     string   `json:"extends,omitempty"`
	Name        string   `json:"name"`
	Consoles    []string `json:"consoles"`
	GameExec    string   `json:"gameExec"`
	RomQuery    string   `json:"romQuery"`
	PostInstall struct {
		MakeLinks MapOfDoom `json:"makeLinks"`
		MakeDirs  []string  `json:"makeDirs"`
		MakeFiles []struct {
			Path    string `json:"path"`
			Content any `json:"content"`
		} `json:"makeFiles"`
	} `json:"postInstall"`
	InstallOptions struct {
		Flatpak       string `json:"flatpak,omitempty"`
		Manual        bool   `json:"manual,omitempty"`
		Aur           string `json:"aur,"`
		AurExportName string `json:"aurExportName"`
		GitRepo       string `json:"gitRepo"`
		GitRe         string `json:"gitRe"`
		LibretroCore  string `json:"libretroCore"`
	} `json:"installOptions"`
}

type GithubReleases struct {
	URL       string `json:"url"`
	AssetsURL string `json:"assets_url"`
	UploadURL string `json:"upload_url"`
	HTMLURL   string `json:"html_url"`
	ID        int    `json:"id"`
	Author    struct {
		Login             string `json:"login"`
		ID                int    `json:"id"`
		NodeID            string `json:"node_id"`
		AvatarURL         string `json:"avatar_url"`
		GravatarID        string `json:"gravatar_id"`
		URL               string `json:"url"`
		HTMLURL           string `json:"html_url"`
		FollowersURL      string `json:"followers_url"`
		FollowingURL      string `json:"following_url"`
		GistsURL          string `json:"gists_url"`
		StarredURL        string `json:"starred_url"`
		SubscriptionsURL  string `json:"subscriptions_url"`
		OrganizationsURL  string `json:"organizations_url"`
		ReposURL          string `json:"repos_url"`
		EventsURL         string `json:"events_url"`
		ReceivedEventsURL string `json:"received_events_url"`
		Type              string `json:"type"`
		UserViewType      string `json:"user_view_type"`
		SiteAdmin         bool   `json:"site_admin"`
	} `json:"author"`
	NodeID          string    `json:"node_id"`
	TagName         string    `json:"tag_name"`
	TargetCommitish string    `json:"target_commitish"`
	Name            string    `json:"name"`
	Draft           bool      `json:"draft"`
	Immutable       bool      `json:"immutable"`
	Prerelease      bool      `json:"prerelease"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
	PublishedAt     time.Time `json:"published_at"`
	Assets          []struct {
		URL      string `json:"url"`
		ID       int    `json:"id"`
		NodeID   string `json:"node_id"`
		Name     string `json:"name"`
		Label    any    `json:"label"`
		Uploader struct {
			Login             string `json:"login"`
			ID                int    `json:"id"`
			NodeID            string `json:"node_id"`
			AvatarURL         string `json:"avatar_url"`
			GravatarID        string `json:"gravatar_id"`
			URL               string `json:"url"`
			HTMLURL           string `json:"html_url"`
			FollowersURL      string `json:"followers_url"`
			FollowingURL      string `json:"following_url"`
			GistsURL          string `json:"gists_url"`
			StarredURL        string `json:"starred_url"`
			SubscriptionsURL  string `json:"subscriptions_url"`
			OrganizationsURL  string `json:"organizations_url"`
			ReposURL          string `json:"repos_url"`
			EventsURL         string `json:"events_url"`
			ReceivedEventsURL string `json:"received_events_url"`
			Type              string `json:"type"`
			UserViewType      string `json:"user_view_type"`
			SiteAdmin         bool   `json:"site_admin"`
		} `json:"uploader"`
		ContentType        string    `json:"content_type"`
		State              string    `json:"state"`
		Size               int       `json:"size"`
		Digest             any       `json:"digest"`
		DownloadCount      int       `json:"download_count"`
		CreatedAt          time.Time `json:"created_at"`
		UpdatedAt          time.Time `json:"updated_at"`
		BrowserDownloadURL string    `json:"browser_download_url"`
	} `json:"assets"`
	TarballURL string `json:"tarball_url"`
	ZipballURL string `json:"zipball_url"`
	Body       string `json:"body"`
	Reactions  struct {
		URL        string `json:"url"`
		TotalCount int    `json:"total_count"`
		Num1       int    `json:"+1"`
		Num10      int    `json:"-1"`
		Laugh      int    `json:"laugh"`
		Hooray     int    `json:"hooray"`
		Confused   int    `json:"confused"`
		Heart      int    `json:"heart"`
		Rocket     int    `json:"rocket"`
		Eyes       int    `json:"eyes"`
	} `json:"reactions"`
}

type GitlabReleases []struct {
	Name            string `json:"name"`
	TagName         string `json:"tag_name"`
	Description     string `json:"description"`
	CreatedAt       string `json:"created_at"`
	ReleasedAt      string `json:"released_at"`
	UpcomingRelease bool   `json:"upcoming_release"`
	Author          struct {
		ID          int         `json:"id"`
		Username    string      `json:"username"`
		PublicEmail interface{} `json:"public_email"`
		Name        string      `json:"name"`
		State       string      `json:"state"`
		Locked      bool        `json:"locked"`
		AvatarURL   string      `json:"avatar_url"`
		WebURL      string      `json:"web_url"`
	} `json:"author"`
	Commit struct {
		ID             string   `json:"id"`
		ShortID        string   `json:"short_id"`
		CreatedAt      string   `json:"created_at"`
		ParentIds      []string `json:"parent_ids"`
		Title          string   `json:"title"`
		Message        string   `json:"message"`
		AuthorName     string   `json:"author_name"`
		AuthorEmail    string   `json:"author_email"`
		AuthoredDate   string   `json:"authored_date"`
		CommitterName  string   `json:"committer_name"`
		CommitterEmail string   `json:"committer_email"`
		CommittedDate  string   `json:"committed_date"`
		Trailers       struct {
		} `json:"trailers"`
		ExtendedTrailers struct {
		} `json:"extended_trailers"`
		WebURL string `json:"web_url"`
	} `json:"commit"`
	CommitPath string `json:"commit_path"`
	TagPath    string `json:"tag_path"`
	Assets     struct {
		Count   int `json:"count"`
		Sources []struct {
			Format string `json:"format"`
			URL    string `json:"url"`
		} `json:"sources"`
		Links []struct {
			ID             int    `json:"id"`
			Name           string `json:"name"`
			URL            string `json:"url"`
			DirectAssetURL string `json:"direct_asset_url"`
			LinkType       string `json:"link_type"`
		} `json:"links"`
	} `json:"assets"`
	Evidences []struct {
		Sha         string `json:"sha"`
		Filepath    string `json:"filepath"`
		CollectedAt string `json:"collected_at"`
	} `json:"evidences"`
	Links struct {
		ClosedIssuesURL        string `json:"closed_issues_url"`
		ClosedMergeRequestsURL string `json:"closed_merge_requests_url"`
		MergedMergeRequestsURL string `json:"merged_merge_requests_url"`
		OpenedIssuesURL        string `json:"opened_issues_url"`
		OpenedMergeRequestsURL string `json:"opened_merge_requests_url"`
		Self                   string `json:"self"`
	} `json:"_links"`
}

type SGDBSearchResults struct {
	Success bool `json:"success"`
	Data    []struct {
		ID          int      `json:"id"`
		Name        string   `json:"name"`
		Verified    bool     `json:"verified"`
		Types       []string `json:"types"`
		ReleaseDate int      `json:"release_date,omitempty"`
	} `json:"data"`
}

type SGDBGrids struct {
	Success bool `json:"success"`
	Page    int  `json:"page"`
	Total   int  `json:"total"`
	Limit   int  `json:"limit"`
	Data    []struct {
		ID        int    `json:"id"`
		Score     int    `json:"score"`
		Style     string `json:"style"`
		Width     int    `json:"width"`
		Height    int    `json:"height"`
		Nsfw      bool   `json:"nsfw"`
		Humor     bool   `json:"humor"`
		Notes     any    `json:"notes"`
		Mime      string `json:"mime"`
		Language  string `json:"language"`
		URL       string `json:"url"`
		Thumb     string `json:"thumb"`
		Lock      bool   `json:"lock"`
		Epilepsy  bool   `json:"epilepsy"`
		Upvotes   int    `json:"upvotes"`
		Downvotes int    `json:"downvotes"`
		Author    struct {
			Name    string `json:"name"`
			Steam64 string `json:"steam64"`
			Avatar  string `json:"avatar"`
		} `json:"author"`
	} `json:"data"`
}


func parseJson[T any](data []byte) (T) {
	var jsonData T
	err := json.Unmarshal(data, &jsonData)
	if err != nil {
		fmt.Println(err.Error())
		return jsonData
	}

	return jsonData
}

func getJsonFile[T any](path string) (T) {
	file, err := os.ReadFile(path)
	var empty T
	if err != nil {
		fmt.Println("getJsonFile: Invalid path provided:", path)
		return empty
	}
	// print(string(file))

	return parseJson[T](file)
}

func fetchJson[T any](url string, sgdbAuth string) (T) {
	return parseJson[T](fetch(url, sgdbAuth))
}

func fetchAppData(id string) FetchedAppData {
	app := fetchJson[FetchedAppData](ASSET_URL + id + ".json", "")
	if app.Extends != "" {
		ogApp := fetchJson[FetchedAppData](ASSET_URL + id + ".json", "")
		app.Consoles = ogApp.Consoles
		app.GameExec = ogApp.GameExec
		app.RomQuery = ogApp.RomQuery
		app.PostInstall = ogApp.PostInstall
		app.InstallOptions = ogApp.InstallOptions
	}
	return app
}

func saveJson[T any](path string, data T) {
	finalData, _ := json.Marshal(data)
	os.WriteFile(path, finalData, os.ModePerm)
}