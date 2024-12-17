import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseInterceptors
} from '@nestjs/common';
import { UsersService } from './providers/users.services';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateUserDTO } from './dtos/create-user.dto';
import { CreateManyUsersDTO } from './dtos/create-many-user.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get()
  public getAllUsers() {
    return this.userService.findAll();
  }

  @Get('/:id?')
  @ApiOperation({
    summary: 'Get one user by id'
  })
  @ApiResponse({
    status: 200,
    description: 'User fetched successfully'
  })
  public findOneById(
    @Param('id', ParseIntPipe)
    id: number
  ) {
    return this.userService.findOneById(id);
  }

  @Post('')
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ description: 'Create a new User' })
  @ApiResponse({ status: 200, description: 'User created successfully' })
  @ApiResponse({
    status: 400,
    description: 'Bad request, data provided has issues'
  })
  @ApiResponse({ status: 500, description: 'An internal server error occured' })
  public createUser(@Body() createUserDTO: CreateUserDTO) {
    return this.userService.createUser(createUserDTO);
  }

  @Post('/create-many')
  @ApiOperation({ description: 'Create many users' })
  public createManyUsers(@Body() createManyUsersDTO: CreateManyUsersDTO) {
    return this.userService.createMany(createManyUsersDTO);
  }
}
