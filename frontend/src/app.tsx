import * as React from "react";
import * as ReactDOM from "react-dom";
import { BrowserRouter, Switch, Route } from "react-router-dom";

import { ApiPost } from "./lib/api/models";
import { About } from "./components/about/about";
import { Header } from "./components/header/header";
import { PostList, Post } from "./components/post/post";
import { Footer } from "./components/footer/footer";

// Stylesheet
import "./app.scss";
import { Api } from "./lib/api/api";

const api = new Api();

interface MainState {
  posts: ApiPost[],
}
interface MainProps {
  post?: ApiPost,
  posts?: ApiPost[],
}

class Main extends React.PureComponent<MainProps, MainState> {
  constructor(props: MainProps) {
    super(props);
    this.state = { posts: [] }
  }

  public componentDidMount() {
    api.fetch().then(() => {
      this.setState({ ...this.state, posts: api.posts });
    });
  }

  private generateRoutes() {
    return this.state.posts.map((p, i) => {
      return (
        <Route key={i} exact path={`/blog/${p.rawData.slug}`} component={() => <Post {...p.toPost()} />} />
      );
    })
  }

  public render() {
    return (
      <Switch>
        <Route exact path="/"
          component={() => <PostList posts={this.state.posts.map(p => p.toPostSummary())} />} />
        {this.generateRoutes()}
      </Switch>
    );
  }
}

const Content: React.FunctionComponent = () => {
  return (
    <main id="content">
      <section className="margin-bottom-50">
        <div className="row around-xs">
          <div className="col-xs-12 col-md-8 col-lg-8">
            <Main />
          </div>
          <div className="col-xs-12 col-md-4 col-lg-4 last-xs last-md">
            <About />
          </div>
        </div>
      </section>
    </main>
  );
}

const App: React.FunctionComponent = () => {
  return (
    <div id="root">
      <Header />
      <Content />
      <Footer />
    </div >
  );
}

ReactDOM.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
  document.getElementById("app"),
);
