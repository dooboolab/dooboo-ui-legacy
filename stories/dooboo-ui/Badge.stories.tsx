import React, { ReactElement, useState } from 'react';
import { SafeAreaView, ScrollView, Text, View } from 'react-native';
import { Badge } from '../../main/Badge';
import { ContainerDeco } from '../../storybook/decorators';
import { storiesOf } from '@storybook/react-native';
import styled from 'styled-components/native';

const Container = styled.View`
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;

const ShowContainer = styled.View`
  justify-content: center;
  align-items: center;
  flex-direction: row;
`;

const StyledTitle = styled.Text`
  font-size: 20px;
  margin-bottom: 20px;
`;

const StyledView: any = styled.View`
  margin: 20px;
  width: 100px;
  height: 100px;
  background-color: gray;
`;

const Badge1 = (): React.ReactElement => {
  return (
    <SafeAreaView>
      <ScrollView
        contentContainerStyle={{
          marginTop: 8,
          alignSelf: 'stretch',
          paddingHorizontal: 20,
          paddingVertical: 100,
        }}>
        <Container>
          <View style={{ marginTop: 50 }}>
            <StyledTitle>Badge (default)</StyledTitle>
            <StyledView>
              <Badge />
            </StyledView>
          </View>

          <View>
            <StyledTitle>Badge (color, count, showZero)</StyledTitle>
            <ShowContainer>
              <StyledView>
                <Badge color="blue" count={17} />
              </StyledView>
              <StyledView>
                <Badge color="pink" count={0} showZero />
              </StyledView>
            </ShowContainer>
          </View>

          <View>
            <StyledTitle>Badge (variant, position)</StyledTitle>
            <ShowContainer>
              <StyledView>
                <Badge variant="dot" color="green" />
              </StyledView>
              <StyledView>
                <Badge color="midnightblue" count={100} position="left" />
              </StyledView>
            </ShowContainer>
          </View>

          <View>
            <StyledTitle>Badge (maximumCount, opacityVisible)</StyledTitle>
            <ShowContainer>
              <StyledView>
                <Badge
                  opacityVisible={false}
                  color="purple"
                  count={300}
                  maximumCount={100}
                />
              </StyledView>
              <StyledView>
                <Badge
                  opacityVisible={true}
                  color="orange"
                  count={300}
                  maximumCount={100}
                />
              </StyledView>
            </ShowContainer>
          </View>

          <View>
            <StyledTitle>Badge (border, textColor)</StyledTitle>
            <ShowContainer>
              <StyledView>
                <Badge color="brown" border="skyblue" count={35} />
              </StyledView>
              <StyledView>
                <Badge color="white" border="red" textColor="red" count={50} />
              </StyledView>
            </ShowContainer>
          </View>
        </Container>
      </ScrollView>
    </SafeAreaView>
  );
};

/**
 * Below are stories for web
 */
export default {
  title: 'Badge',
};

export const toStorybook1 = (): ReactElement => <Badge1 />;
// export const toStorybook2 = (): ReactElement => <Badge2 />;

toStorybook1.story = {
  name: 'default',
  notes: 'Basic Badge style',
};
// toStorybook2.story = {
//   name: 'Badge2',
//   notes: 'You can change the label position.',
// };

/**
 * Below are stories for app
 */
storiesOf('Badge', module)
  .addDecorator(ContainerDeco)
  .add('default', () => <Badge1 />, {
    notes: 'Basic Badge style',
  })
