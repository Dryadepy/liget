import * as React from 'react';
import './SearchResults.css';

interface SearchResultsProps {
  input: string;
  onSelect(value: string): void;
}

interface Package {
  id: string;
  authors: string;
  totalDownloads: number;
  latestVersion: string;
  tags: string[];
  description: string;
  iconUrl: string;
}

interface SearchResultsState {
  items: Package[];
}

export default class Search extends React.Component<SearchResultsProps, SearchResultsState> {

  readonly defaultIconUrl: string = 'https://www.nuget.org/Content/gallery/img/default-package-icon-256x256.png';

  constructor(props: SearchResultsProps) {
    super(props);

    this.state = {items: []};
  }

  componentDidMount() {
    this._loadItems(this.props.input);
  }

  componentWillReceiveProps(props: Readonly<SearchResultsProps>) {
    this._loadItems(props.input);
  }

  render() {
    return (
      <div>
        {this.state.items.map(value => (
          <div key={value.id} className="row search-result">
            <div className="col-sm-1 hidden-xs hidden-sm">
              <img src={value.iconUrl} className="package-icon img-responsive" onError={(e) => e.currentTarget.src = this.defaultIconUrl} />
            </div>
            <div className="col-sm-11">
              <div>
                <h2><a href="#" onClick={e => this.props.onSelect(value.id)}>{value.id}</a></h2>
                <span>by: {value.authors}</span>
              </div>
              <div className="info">
                <span>{value.totalDownloads.toLocaleString()} total downloads</span>
                <span>Latest version: {value.latestVersion}</span>
                <span>{value.tags.join(' ')}</span>
              </div>
              <div>
                {value.description}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  private _loadItems(query: string): void {
    let url = (query && query.length != 0)
      ? `/v3/search?q=${encodeURIComponent(query)}`
      : `/v3/search`;

    fetch(url).then(response => {
      return response.json();
    }).then(results => {
      let items: Package[] = [];

      for (let entry of results["data"]) {
        let iconUrl = entry["iconUrl"];

        if (!iconUrl) {
          iconUrl = this.defaultIconUrl;
        }

        items.push({
          id: entry["id"],
          authors: entry["authors"],
          totalDownloads: entry["totalDownloads"],
          latestVersion: entry["version"],
          tags: entry["tags"],
          description: entry["description"],
          iconUrl: iconUrl,
        });
      }

      this.setState({ items: items });
    });
  }
}