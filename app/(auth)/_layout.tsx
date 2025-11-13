import { Slot } from 'expo-router'
import React from 'react'
import { Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const _layout = () => {
  return (
    <SafeAreaView>
      <Text>auth _layout</Text>
      <Slot/>
    </SafeAreaView>
  )
}

export default _layout