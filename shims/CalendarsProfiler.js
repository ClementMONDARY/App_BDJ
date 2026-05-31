import React from 'react';

export default class Profiler extends React.Component {
  render() {
    return this.props.children || null;
  }
}

export const getProfileData = () => ({});
export const logProfileData = () => {};
