import React from "react";
import createReactClass from "create-react-class";
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";
import URI from "urijs";
import addedByUser from "../../Core/addedByUser";
import removeUserAddedData from "../../Models/removeUserAddedData";
import CatalogGroup from "./CatalogGroup";
import DataCatalogMember from "./DataCatalogMember";
import getAncestors from "../../Models/getAncestors";
import ObserveModelMixin from "../ObserveModelMixin";

const DataCatalogGroup = createReactClass({
  displayName: "DataCatalogGroup",
  mixins: [ObserveModelMixin],

  propTypes: {
    group: PropTypes.object.isRequired,
    viewState: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired,
    /** Overrides whether to get the open state of the group from the group model or manage it internally */
    manageIsOpenLocally: PropTypes.bool,
    userData: PropTypes.bool,
    removable: PropTypes.bool,
    terria: PropTypes.object
  },

  getDefaultProps() {
    return {
      manageIsOpenLocally: false,
      userData: false
    };
  },

  getInitialState() {
    return {
      /** Only used if manageIsOpenLocally === true */
      isOpen: false
    };
  },

  componentDidMount() {
    const group = this.props.group;
    if (!group.isOpen) {
      if (this.isSelected() && group.toggleOpen) {
        // Toggle open when we initially navigate to a group
        group.isOpen = true;
      }
    }
  },

  toggleStateIsOpen() {
    this.setState({
      isOpen: !this.state.isOpen
    });
  },

  isOpen() {
    if (this.props.manageIsOpenLocally) {
      return this.state.isOpen;
    }
    return this.props.group.isOpen;
  },

  toggleOpen() {
    if (this.props.manageIsOpenLocally) {
      this.toggleStateIsOpen();
    }
    this.props.group.toggleOpen();
  },

  clickGroup() {
    this.toggleOpen();
    this.props.viewState.viewCatalogMember(this.props.group);
  },

  isTopLevel() {
    const parent = this.props.group.parent;
    return !parent || !parent.parent;
  },

  isSelected() {
    const match = this.props.match || {};
    const { params } = match;
    return (
      (addedByUser(this.props.group)
        ? this.props.viewState.userDataPreviewedItem === this.props.group
        : this.props.viewState.previewedItem === this.props.group) ||
      URI.decode(params.catalogMemberId) === this.props.group.uniqueId
    );
  },

  getNameOrPrettyUrl() {
    // Grab a name via nameInCatalog, if it's a blank string, try and generate one from the url
    const group = this.props.group;
    const nameInCatalog = group.nameInCatalog || "";
    if (nameInCatalog !== "") {
      return nameInCatalog;
    }

    const url = group.url || "";
    // strip protocol
    return url.replace(/^https?:\/\//, "");
  },

  render() {
    const group = this.props.group;

    return (
      <CatalogGroup
        linkTo={URI.encode(group.uniqueId)}
        text={this.getNameOrPrettyUrl()}
        title={getAncestors(group)
          .map(member => member.nameInCatalog)
          .join(" → ")}
        topLevel={this.isTopLevel()}
        open={this.isOpen()}
        loading={group.isLoading}
        emptyMessage="This group is empty"
        onClick={this.clickGroup}
        removable={this.props.removable}
        removeUserAddedData={removeUserAddedData.bind(
          this,
          this.props.terria,
          this.props.group
        )}
        selected={this.isSelected()}
      >
        <If condition={this.isOpen()}>
          <For each="item" of={group.items}>
            <DataCatalogMember
              key={item.uniqueId}
              member={item}
              viewState={this.props.viewState}
              userData={this.props.userData}
              overrideOpen={this.props.manageIsOpenLocally}
            />
          </For>
        </If>
      </CatalogGroup>
    );
  }
});

module.exports = withRouter(DataCatalogGroup);
