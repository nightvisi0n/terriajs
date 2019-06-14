import PropTypes from "prop-types";
import React from "react";
import defined from "terriajs-cesium/Source/Core/defined";
import Mappable from "../../Models/Mappable";
import Terria from "../../Models/Terria";
import ViewState from "../../ReactViewModels/ViewState";
import DataPreviewMap from "./DataPreviewMap";
// import DataPreviewMap from "./DataPreviewMap";
import Description from "./Description";
import Styles from "./mappable-preview.scss";

/**
 * @typedef {object} Props
 * @prop {Terria} terria
 * @prop {Mappable} previewed
 * @prop {ViewState} viewState
 *
 */

/**
 * CatalogItem preview that is mappable (as opposed to say, an analytics item that can't be displayed on a map without
 * configuration of other parameters.
 * @extends {React.Component<Props>}
 */
class MappablePreview extends React.Component {
  static propTypes = {
    previewed: PropTypes.object.isRequired,
    terria: PropTypes.object.isRequired,
    viewState: PropTypes.object.isRequired
  };

  toggleOnMap(event) {
    if (defined(this.props.viewState.storyShown)) {
      this.props.viewState.storyShown = false;
    }
    const catalogItem = this.props.previewed;
    if (catalogItem.loadReference) {
      // TODO: handle promise rejection
      catalogItem.loadReference();
    }
    const workbench = this.props.terria.workbench;
    if (workbench.contains(catalogItem)) {
      // catalogItem.ancestors = undefined;
      workbench.remove(catalogItem);
    } else {
      // catalogItem.ancestors = this.props.ancestors;
      if (catalogItem.loadMapItems) {
        // TODO: handle promise rejection.
        catalogItem.loadMapItems();
      }

      workbench.add(catalogItem);
    }

    if (workbench.contains(catalogItem) && !event.shiftKey && !event.ctrlKey) {
      this.props.viewState.explorerPanelIsVisible = false;
      this.props.viewState.mobileView = null;
    }
  }

  backToMap() {
    this.props.viewState.explorerPanelIsVisible = false;
  }

  render() {
    return (
      <div className={Styles.root}>
        <If
          condition={
            Mappable.is(this.props.previewed) && !catalogItem.disablePreview
          }
        >
          <DataPreviewMap
            terria={this.props.terria}
            previewed={this.props.previewed}
            showMap={
              !this.props.viewState.explorerPanelAnimating ||
              this.props.viewState.useSmallScreenInterface
            }
          />
        </If>
        <button
          type="button"
          onClick={this.toggleOnMap}
          className={Styles.btnAdd}
        >
          {this.props.terria.workbench.contains(this.props.previewed)
            ? "Remove from the map"
            : "Add to the map"}
        </button>
        <div className={Styles.previewedInfo}>
          <h3 className={Styles.h3}>{this.props.previewed.name}</h3>
          <Description item={this.props.previewed} />
        </div>
      </div>
    );
  }
}
export default MappablePreview;
