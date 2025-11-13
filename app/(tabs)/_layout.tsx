import { Redirect, Slot } from 'expo-router';
import React from 'react';

export default function _layout() {
    const inAuthenticated =false;
    if(!inAuthenticated) return <Redirect href="/sign-in"/>
  return <Slot />
}