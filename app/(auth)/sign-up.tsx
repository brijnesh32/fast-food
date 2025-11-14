import { router } from 'expo-router'
import React, { Component } from 'react'
import { Button, Text, View } from 'react-native'


export class Signup extends Component {
  render() {
    return (
      <View>
        <Text>loginin</Text>
        <Button title='Sign In' onPress={() => router.push('/sign-in')}/>
      </View>
    )
  }
}

export default Signup